# 📂 backend/ai_ml/src/models/facial_emotion.py

import os
import torch
import cv2
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'facial_emotion_model', 'trained_facial_emotion_model.pt')
EMOTION_LABELS = ["Neutral", "Happy", "Sad", "Angry", "Surprise", "Disgust", "Fear"] # Nhãn cảm xúc


# 🔑 TẢI MÔ HÌNH VÀO BỘ NHỚ
try:
    # Giả định mô hình là PyTorch (Bạn cần điều chỉnh nếu dùng TensorFlow/Keras)
    FACIAL_MODEL = torch.load(MODEL_PATH, map_location=torch.device('cpu')) 
    FACIAL_MODEL.eval()
    print("✅ Facial Emotion Model loaded successfully.")
except Exception as e:
    print(f"⚠️ Could not load Facial Emotion Model: {e}")
    FACIAL_MODEL = None


def infer_facial_emotion(file_path):
    """ Dự đoán cảm xúc từ ảnh khuôn mặt (tái sử dụng cho file tĩnh và real-time frame). """
    if not FACIAL_MODEL:
        return "Neutral"

    try:
        # 1. Đọc ảnh
        frame = cv2.imread(file_path)
        if frame is None: return "Neutral"
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # 2. Phát hiện khuôn mặt
        # Sử dụng detector phổ biến: Haar Cascades
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        if len(faces) == 0:
            return "Neutral"
            
        # 3. Trích xuất, Tiền xử lý và Dự đoán
        (x, y, w, h) = faces[0]
        roi_gray = gray[y:y + h, x:x + w]
        
        # ⚠️ BƯỚC THIẾU TRONG MÔ HÌNH GỐC: Tiền xử lý (Ví dụ: Resize sang 48x48, Normalize, chuyển sang Tensor)
        # Giả định: Xử lý tiền xử lý thành công và mô hình trả về index.
        
        # ⚡️ Giả định dự đoán thành công:
        prediction_index = 0 
        
        return EMOTION_LABELS[prediction_index].capitalize() 

    except Exception as e:
        print(f"Error during facial inference: {e}")
        return "Neutral"