import os
import base64
import io
from typing import List, Dict, Optional, Any

from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing_extensions import Annotated
from fastapi.middleware.cors import CORSMiddleware

# MongoDB
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from bson.objectid import ObjectId

# AI
import torch
import cv2
import numpy as np
from fer.fer import FER
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from PIL import Image

import uvicorn
import traceback

# ---------------- CONFIG ----------------
MONGO_URI = "mongodb+srv://musicapppr:12345678%40@cluster0.6gt8dkf.mongodb.net"
DATABASE_NAME = "musicapppr"
# PATH to text model folder (if exists)
TEXT_MODEL_PATH = r"D:\PBL6\musicapppr_full\musicapppr_backend\AI\models\text_emotion_model"
MAX_LENGTH = 128
DEFAULT_PREFERRED_GENRE = "Pop"

TEXT_MOOD_MAP = {
    "sadness": "Sad",
    "joy": "Happy",
    "love": "Love",
    "anger": "Anger",
    "fear": "Anxiety"
}
TEXT_EMOTION_LABELS = list(TEXT_MOOD_MAP.keys())

FER_MOOD_MAP = {
    "happy": "Happy",
    "sad": "Sad",
    "angry": "Anger",
    "surprise": "Powerful",
    "disgust": "Anger",
    "fear": "Anxiety",
    "neutral": "Calm"
}

MOOD_GENRE_MAP = {
    "Happy": "Dance",
    "Sad": "Ballad",
    "Anger": "Rock",
    "Calm": "LoFi",
    "Love": "R&B",
    "Anxiety": "Chill",
    "Powerful": "EDM",
    "Neutral": "Pop"
}

# === FASTAPI APP ===
app = FastAPI()

# === CORS Full Allow (for dev) ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev: allow all; production: lock to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Allow OPTIONS
@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str, request: Request):
    return JSONResponse(status_code=200, content={"message": "OK"})


# --- MongoDB globals ---
client = None
db = None
song_collection = None
mood_collection = None
genre_collection = None

# --- AI Models globals ---
emotion_detector = None
text_tokenizer = None
text_model = None
text_model_loaded = False

# === UTIL ===
def validate_object_id(v: Any) -> str:
    if isinstance(v, ObjectId):
        return str(v)
    return str(v)

MongoID = Annotated[str, validate_object_id]

class TextIn(BaseModel):
    text: str

class StreamIn(BaseModel):
    image_base64: str

class SongDetail(BaseModel):
    name: str
    artist: MongoID
    image: str
    file: str
    duration: int

class SuggestionOut(BaseModel):
    emotion: str
    genre: str
    suggestions: List[SongDetail]


# === INIT FUNCTIONS ===
def init_mongo():
    global client, db, song_collection, mood_collection, genre_collection
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        # test connection
        client.admin.command('ping')
        db = client[DATABASE_NAME]
        song_collection = db["songs"]
        mood_collection = db["moods"]
        genre_collection = db["genres"]
        print("MongoDB OK")
    except Exception as e:
        print("MongoDB connection failed:", e)
        # keep running but queries will fail later


def init_models():
    global emotion_detector, text_tokenizer, text_model, text_model_loaded
    try:
        # FER detector using mtcnn (if available)
        try:
            emotion_detector = FER(mtcnn=True)
        except Exception as e:
            print("FER init with mtcnn failed, trying without mtcnn:", e)
            emotion_detector = FER(mtcnn=False)

        # Try load text model if path exists and looks valid
        if os.path.exists(TEXT_MODEL_PATH):
            try:
                text_tokenizer = AutoTokenizer.from_pretrained(TEXT_MODEL_PATH)
                text_model = AutoModelForSequenceClassification.from_pretrained(TEXT_MODEL_PATH)
                text_model.eval()
                text_model_loaded = True
                print("Text model loaded.")
            except Exception as e:
                print("Failed to load text model from path:", TEXT_MODEL_PATH, e)
                text_model_loaded = False
        else:
            print("Text model path does not exist:", TEXT_MODEL_PATH)
            text_model_loaded = False

        print("FER model ready.")
    except Exception as e:
        print("Model init error:", e)
        traceback.print_exc()


@app.on_event("startup")
async def startup():
    init_mongo()
    init_models()


# --- CORE FUNCTIONS ---
def infer_text_emotion(text: str) -> str:
    # fallback neutral if model not loaded
    if not text_model_loaded or text_model is None:
        return "Neutral"
    try:
        inputs = text_tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=MAX_LENGTH)
        with torch.no_grad():
            outputs = text_model(**inputs)
            logits = outputs.logits[0].cpu().numpy()
        idx = int(np.argmax(logits))
        # protect index
        if idx < 0 or idx >= len(TEXT_EMOTION_LABELS):
            return "Neutral"
        label = TEXT_EMOTION_LABELS[idx]
        return TEXT_MOOD_MAP.get(label, "Neutral")
    except Exception as e:
        print("Text emotion infer error:", e)
        return "Neutral"


def infer_face_emotion(frame: np.ndarray) -> str:
    """
    frame: BGR (cv2) image. FER expects RGB; convert before detect.
    """
    try:
        if frame is None:
            return "Neutral"
        # some image decodes return None
        # ensure it's RGB for FER (PIL-like)
        if len(frame.shape) == 3 and frame.shape[2] == 3:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        else:
            # grayscale -> convert to 3-channel
            rgb = cv2.cvtColor(frame, cv2.COLOR_GRAY2RGB)

        detected = emotion_detector.detect_emotions(rgb)
        if not detected:
            return "Neutral"
        emotions = detected[0].get('emotions', {})
        if not emotions:
            return "Neutral"
        # fer labels may be lowercase or mixed; normalize
        fer_label = max(emotions, key=emotions.get)
        fer_label_normal = fer_label.lower()
        # map - try lowercase mapping
        for k, v in FER_MOOD_MAP.items():
            if k.lower() == fer_label_normal:
                return v
        # fallback
        return FER_MOOD_MAP.get(fer_label, "Neutral")
    except Exception as e:
        print("FER detection error:", e)
        traceback.print_exc()
        return "Neutral"


def get_genre_from_mood(mood: str) -> str:
    return MOOD_GENRE_MAP.get(mood, DEFAULT_PREFERRED_GENRE)


# --- NEW: fallback list for genres ---
def get_genre_fallback_list(preferred_genre: str) -> List[str]:
    """
    Return a fallback list of genres based on preferred genre.
    Example logic:
        - First priority: preferred genre
        - Next: all other genres (sorted alphabetically)
    """
    try:
        all_genres = list(genre_collection.find({}, {"name": 1}))
        all_names = [g["name"] for g in all_genres]

        # Put preferred first, then the rest
        fallback_list = [preferred_genre] + [g for g in all_names if g != preferred_genre]
        return fallback_list
    except:
        # Worst-case fallback
        return [preferred_genre, "Pop", "EDM", "R&B", "Rock", "Ballad", "LoFi", "Chill"]
        


async def get_pro_suggested_songs(mood: str, preferred_genre: str):
    try:
        mood_doc = None
        if mood:
            mood_doc = mood_collection.find_one({
                "$expr": {
                    "$eq": [
                        {"$toLower": {"$trim": {"input": "$name"}}},
                        mood.strip().lower()
                    ]
                }
            })

        genre_doc = None
        if preferred_genre:
            genre_doc = genre_collection.find_one({
                "$expr": {
                    "$eq": [
                        {"$toLower": {"$trim": {"input": "$name"}}},
                        preferred_genre.strip().lower()
                    ]
                }
            })

        # BUILD QUERY ĐÚNG CHUẨN ARRAY
        match_stage = {}
        if mood_doc is not None:
            match_stage["moods"] = mood_doc["_id"]   # <--- FIX QUAN TRỌNG
        if genre_doc is not None:
            match_stage["genres"] = genre_doc["_id"] # <--- FIX QUAN TRỌNG

        pipeline = [
            {"$match": match_stage},
            {"$sort": {"playCount": -1}},
            {"$limit": 10},
            {"$project": {
                "_id": 0,
                "name": 1,
                "artist": {"$toString": "$artist"},
                "image": 1,
                "file": 1,
                "duration": 1
            }}
        ]

        return list(song_collection.aggregate(pipeline))

    except Exception as e:
        print("get_pro_suggested_songs error:", e)
        return []


# --- API ROUTES ---
@app.post("/api/emotion/text", response_model=SuggestionOut)
async def predict_text(req: TextIn):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text is empty")

    mood = infer_text_emotion(req.text)
    genre = get_genre_from_mood(mood)
    songs = await get_pro_suggested_songs(mood, genre)

    return SuggestionOut(
        emotion=mood,
        genre=genre,
        suggestions=songs
    )


@app.post("/api/emotion/upload", response_model=SuggestionOut)
async def upload_image(file: UploadFile = File(...)):
    data = await file.read()
    # decode buffer to numpy
    nparr = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image file")

    mood = infer_face_emotion(img)
    genre = get_genre_from_mood(mood)
    songs = await get_pro_suggested_songs(mood, genre)

    return SuggestionOut(
        emotion=mood,
        genre=genre,
        suggestions=songs
    )


@app.post("/api/emotion/stream", response_model=SuggestionOut)
async def stream_image(data: StreamIn):
    """
    Accepts image_base64 either with data URI prefix or raw base64 string.
    """
    raw = data.image_base64.strip()
    # If client sent "data:image/jpeg;base64,....", split
    if raw.startswith("data:"):
        try:
            raw = raw.split(",", 1)[1]
        except Exception:
            pass

    try:
        img_bytes = base64.b64decode(raw)
    except Exception as e:
        # If decoding fails, return error
        raise HTTPException(status_code=400, detail="Invalid base64 image data")

    nparr = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(status_code=400, detail="Cannot decode image frame")

    mood = infer_face_emotion(frame)
    genre = get_genre_from_mood(mood)
    songs = await get_pro_suggested_songs(mood, genre)

    return SuggestionOut(
        emotion=mood,
        genre=genre,
        suggestions=songs
    )


# Health check route
@app.get("/api/health")
async def health():
    return {"status": "ok", "mongo_connected": bool(client), "text_model_loaded": text_model_loaded}


# === RUN SERVER ===
if __name__ == "__main__":
    uvicorn.run("mainapi:app", host="127.0.0.1", port=8000, reload=True)
