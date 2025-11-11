# 📂 backend/ai_ml/src/models/speech_emotion.py

import os
import pickle
import librosa
import numpy as np

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'speech_emotion_model')
SCALER_PATH = os.path.join(MODEL_DIR, 'scaler.pkl')
MODEL_PATH = os.path.join(MODEL_DIR, 'trained_speech_emotion_model.pkl')

# 🔑 TẢI MÔ HÌNH VÀ SCALER VÀO BỘ NHỚ
try:
    with open(SCALER_PATH, 'rb') as f:
        SPEECH_SCALER = pickle.load(f)
    with open(MODEL_PATH, 'rb') as f:
        SPEECH_MODEL = pickle.load(f)
    print("✅ Speech Emotion Model loaded successfully.")
except Exception as e:
    print(f"⚠️ Could not load Speech Emotion Model: {e}")
    SPEECH_MODEL = None
    SPEECH_SCALER = None


def extract_features(file_path):
    """ Trích xuất các đặc trưng âm học (MFCCs). """
    # Giả định AUDIO_DURATION_SEC được import từ config hoặc là 3.0s
    AUDIO_DURATION_SEC = 3.0 
    
    y, sr = librosa.load(file_path, duration=AUDIO_DURATION_SEC, offset=0.5)
    
    # Tính toán MFCCs và lấy giá trị trung bình
    mfccs = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40).T, axis=0)
    
    return mfccs

def infer_speech_emotion(file_path):
    """ Dự đoán cảm xúc từ file audio. """
    if not SPEECH_MODEL or not SPEECH_SCALER:
        return "Neutral"

    try:
        features = extract_features(file_path)
        # Reshape và Scale đặc trưng
        features = features.reshape(1, -1)
        features_scaled = SPEECH_SCALER.transform(features)
        
        # Dự đoán
        emotion_prediction = SPEECH_MODEL.predict(features_scaled)[0]
        return emotion_prediction.capitalize()
    except Exception as e:
        print(f"Error during speech inference: {e}")
        return "Neutral"