
import os
from transformers import pipeline

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, 'text_emotion_model')

try:
    TEXT_EMOTION_PIPELINE = pipeline(
        "sentiment-analysis", 
        model=MODEL_DIR, 
        tokenizer=MODEL_DIR
    )
    print("✅ Text Emotion Model loaded successfully.")
except Exception as e:
    print(f"⚠️ Could not load Text Emotion Model: {e}")
    TEXT_EMOTION_PIPELINE = None


def infer_text_emotion(text):
    """ Dự đoán cảm xúc từ văn bản và chuyển đổi nhãn. """
    if not TEXT_EMOTION_PIPELINE:
        return "Neutral"

    try:
        result = TEXT_EMOTION_PIPELINE(text)[0]

        emotion_label = result['label'].split('_')[-1] 
        return emotion_label.capitalize() 
    except Exception as e:
        print(f"Error during text inference: {e}")
        return "Neutral"