import os
import base64
import io
from typing import List, Dict, Optional, Any

from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, BeforeValidator
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

MONGO_URI = "mongodb+srv://musicapppr:12345678%40@cluster0.6gt8dkf.mongodb.net"
DATABASE_NAME = "musicapppr"
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
    "Happy": "Happy",
    "Sad": "Sad",
    "Anger": "Anger",
    "Surprise": "Powerful",
    "Disgust": "Anger",
    "Fear": "Anxiety",
    "Neutral": "Calm"
}

# === FASTAPI APP ===
app = FastAPI()

# === FIX: CORS Full Allow ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # cho test local, bạn có thể đổi về localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === FIX: Chấp nhận OPTIONS để tránh 400 ===
@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str, request: Request):
    """Trả về OK cho tất cả OPTIONS requests."""
    return JSONResponse(status_code=200, content={"message": "OK"})


# --- MongoDB ---
client = None
db = None
song_collection = None
mood_collection = None
genre_collection = None

# --- AI Models ---
emotion_detector = None
text_tokenizer = None
text_model = None

# === UTIL ===
def validate_object_id(v: Any) -> str:
    if isinstance(v, ObjectId):
        return str(v)
    return str(v)

MongoID = Annotated[str, BeforeValidator(validate_object_id)]

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


# === INIT ===
def init_mongo():
    global client, db, song_collection, mood_collection, genre_collection

    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    song_collection = db["songs"]
    mood_collection = db["moods"]
    genre_collection = db["genres"]
    print("MongoDB OK")

def init_models():
    global emotion_detector, text_tokenizer, text_model
    emotion_detector = FER(mtcnn=True)
    text_tokenizer = AutoTokenizer.from_pretrained(TEXT_MODEL_PATH)
    text_model = AutoModelForSequenceClassification.from_pretrained(TEXT_MODEL_PATH)
    text_model.eval()
    print("Models loaded")


@app.on_event("startup")
async def startup():
    init_mongo()
    init_models()


# === CORE FUNCTIONS ===
def infer_text_emotion(text: str) -> str:
    if not text_model:
        return "Neutral"
    inputs = text_tokenizer(text, return_tensors="pt", padding=True, truncation=True)
    with torch.no_grad():
        logits = text_model(**inputs).logits[0].numpy()
    idx = logits.argmax()
    label = TEXT_EMOTION_LABELS[idx]
    return TEXT_MOOD_MAP.get(label, "Neutral")

def infer_face_emotion(frame: np.ndarray) -> str:
    try:
        detected = emotion_detector.detect_emotions(frame)
        if not detected:
            return "Neutral"
        emotions = detected[0]['emotions']
        fer_label = max(emotions, key=emotions.get)
        return FER_MOOD_MAP.get(fer_label, "Neutral")
    except:
        return "Neutral"


async def get_pro_suggested_songs(mood: str, preferred: str = DEFAULT_PREFERRED_GENRE):
    mood_doc = mood_collection.find_one({"name": {"$regex": mood, "$options": "i"}})
    mood_id = mood_doc["_id"] if mood_doc else None

    genre_doc = genre_collection.find_one({"name": {"$regex": preferred, "$options": "i"}})
    genre_id = genre_doc["_id"] if genre_doc else None

    pipeline = [
        {"$sort": {"playCount": -1}},
        {"$limit": 1000},
        {"$addFields": {
            "ranking_score": {"$toDouble": {"$ifNull": ["$playCount", 0]}}
        }},
        {"$sort": {"ranking_score": -1}},
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


# === API ROUTES ===

@app.post("/api/emotion/text", response_model=SuggestionOut)
async def predict_text(req: TextIn):
    if not req.text.strip():
        raise HTTPException(400, "Text is empty")

    mood = infer_text_emotion(req.text)
    songs = await get_pro_suggested_songs(mood)

    return SuggestionOut(
        emotion=mood,
        genre=DEFAULT_PREFERRED_GENRE,
        suggestions=songs
    )


@app.post("/api/emotion/upload", response_model=SuggestionOut)
async def upload_image(file: UploadFile = File(...)):
    data = await file.read()
    np_img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)

    mood = infer_face_emotion(np_img)
    songs = await get_pro_suggested_songs(mood)

    return SuggestionOut(
        emotion=mood,
        genre=DEFAULT_PREFERRED_GENRE,
        suggestions=songs
    )


@app.post("/api/emotion/stream", response_model=SuggestionOut)
async def stream_image(data: StreamIn):
    raw = data.image_base64.split(",")[-1]
    img = base64.b64decode(raw)
    frame = cv2.imdecode(np.frombuffer(img, np.uint8), cv2.IMREAD_COLOR)

    mood = infer_face_emotion(frame)
    songs = await get_pro_suggested_songs(mood)

    return SuggestionOut(
        emotion=mood,
        genre=DEFAULT_PREFERRED_GENRE,
        suggestions=songs
    )


# === RUN SERVER ===
if __name__ == "__main__":
    uvicorn.run("main_fastapi:app", host="127.0.0.1", port=8000, reload=True)
