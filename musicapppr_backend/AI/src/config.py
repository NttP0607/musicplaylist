# 📂 backend/ai_ml/src/config.py

import os

# Định nghĩa thư mục gốc của AI (một cấp trên thư mục src)
# Giả sử file config.py nằm trong src
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) 
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, '..', '..'))

CONFIG = {
    "API_PORT": 5000, 
    "DB_URI": "mongodb+srv://musicapppr:12345678%40@cluster0.6gt8dkf.mongodb.net", 
    "MAX_RECOMMENDATIONS": 10,
    "AUDIO_DURATION_SEC": 3.0,
    
    # Đường dẫn đến thư mục chứa mô hình (từ thư mục gốc của backend)
    "MODEL_BASE_PATH": os.path.join(PROJECT_ROOT, 'AI'), 
    
    # Cấu hình cụ thể cho mô hình Text (ví dụ, tên directory đã lưu)
    "TEXT_MODEL_OUTPUT_DIR": os.path.join(PROJECT_ROOT, 'AI', 'text_emotion_model'), 
}

EMOTION_MAPPING = {
    "Joy": "Happy",
    "Happy": "Happy",
    "Sadness": "Sad",
    "Anger": "Powerful",
    "Love": "Romantic",
    "Fear": "Anxiety",
    "Neutral": "Relax",
    "Calm": "Calm",
    "Disgust": "Anger",   
    "Surprise": "Powerful", 
}