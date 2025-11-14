import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# --- CẤU HÌNH GIẢ ĐỊNH ---
# THAY THẾ CÁC GIÁ TRỊ NÀY VỚI THÔNG TIN TỪ CONFIG CỦA BẠN!
MODEL_PATH = "D:/PBL6/musicapppr_full/musicapppr_backend/AI/text_emotion_model"  # Đường dẫn tới thư mục mô hình
MAX_LENGTH = 128                     # Chiều dài tối đa của chuỗi
# Lưu ý: Cần kiểm tra thứ tự nhãn chính xác trong config.json của mô hình bạn.
EMOTION_LABELS = ["sadness", "joy", "love", "anger", "fear"] 

# --- 1. Tải Mô hình và Tokenizer (Chỉ một lần) ---
def load_model_and_tokenizer(model_path, max_length):
    """Tải mô hình và tokenizer và in ra cấu hình nhãn."""
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_path)
        model = AutoModelForSequenceClassification.from_pretrained(model_path)
        model.eval() # Đặt mô hình ở chế độ đánh giá
        print(f"✅ Đã tải mô hình từ '{model_path}' thành công.")
        
        # In nhãn ra màn hình để người dùng kiểm tra
        print(f"Nhãn cảm xúc được sử dụng (theo thứ tự ID): {EMOTION_LABELS}")
        
        return tokenizer, model
    except Exception as e:
        print(f"❌ Lỗi khi tải mô hình từ đường dẫn: {model_path}. Lỗi: {e}")
        return None, None

# --- 2. Hàm Dự đoán Cảm xúc ---
def infer_text_emotion(text, tokenizer, model, max_length):
    """
    Infer the emotion from the given text using the trained text emotion model.

    :param text: Văn bản đầu vào.
    :param tokenizer: Đối tượng tokenizer đã tải.
    :param model: Đối tượng model đã tải.
    :param max_length: Chiều dài tối đa.
    :return: Cảm xúc được phát hiện.
    """
    if not model or not tokenizer:
        return "Lỗi: Mô hình chưa được tải thành công."

    try:
        inputs = tokenizer(
            text, 
            return_tensors="pt", 
            padding=True, 
            truncation=True, 
            max_length=max_length
        )

        with torch.no_grad():
            outputs = model(**inputs)

        # Lấy kết quả từ logits và chuyển thành numpy
        scores = outputs.logits[0].numpy()
        emotion_idx = scores.argmax()

        # Ánh xạ chỉ số (index) thành nhãn (label)
        if emotion_idx < len(EMOTION_LABELS):
            return EMOTION_LABELS[emotion_idx]
        else:
            return f"Lỗi: Chỉ số cảm xúc ({emotion_idx}) nằm ngoài phạm vi nhãn."
            
    except Exception as e:
        return f"Lỗi trong quá trình dự đoán: {e}"

# --- 3. Chương trình Chính: Nhập từ Bàn phím ---
if __name__ == "__main__":
    tokenizer, model = load_model_and_tokenizer(MODEL_PATH, MAX_LENGTH)
    
    if tokenizer and model:
        print("\n--- Sẵn sàng Dự đoán Cảm xúc ---")
        print("Nhập 'exit' hoặc 'thoat' để kết thúc.")
        
        while True:
            # Nhập văn bản từ bàn phím
            input_text = input("\nNhập văn bản của bạn: ")
            
            # Kiểm tra lệnh thoát
            if input_text.lower() in ['exit', 'thoat']:
                print("👋 Kết thúc chương trình.")
                break
            
            if input_text.strip():
                # Dự đoán cảm xúc
                result = infer_text_emotion(input_text, tokenizer, model, MAX_LENGTH)
                
                # Hiển thị kết quả
                print(f"➡️ **Cảm xúc Dự đoán:** **{result.upper()}**")
            else:
                print("Văn bản không được để trống.")