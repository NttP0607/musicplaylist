import cv2
import time
from fer.fer import FER
import os

# --- 1. KHỞI TẠO MÔ HÌNH VÀ CAMERA ---

# Khởi tạo mô hình FER (Tự động tải model pre-trained)
try:
    print("Đang khởi tạo mô hình FER...")
    # Sử dụng MTCNN để phát hiện khuôn mặt chính xác hơn
    emotion_detector = FER(mtcnn=True) 
    print("✅ Khởi tạo mô hình thành công.")
except Exception as e:
    print(f"⚠️ Lỗi khởi tạo mô hình FER: {e}")
    emotion_detector = None
    exit()

# Khởi tạo camera (Thử nghiệm với index 0)
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("❌ Lỗi: Không thể mở camera. Vui lòng kiểm tra kết nối camera.")
    exit()

# Cài đặt tốc độ khung hình (optional)
# cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
# cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

# --- 2. VÒNG LẶP DỰ ĐOÁN REAL-TIME ---

while True:
    # 1. Đọc Khung hình
    ret, frame = cap.read()
    if not ret:
        print("Không thể nhận khung hình từ camera. Thoát.")
        break
    
    # 2. Xử lý và Dự đoán Cảm xúc
    
    # FER hoạt động với ảnh BGR/RGB, không cần chuyển sang grayscale
    # Hàm detect_emotions sẽ thực hiện phát hiện khuôn mặt và dự đoán cảm xúc
    results = emotion_detector.detect_emotions(frame)
    
    dominant_emotion = "Neutral"
    
    if results:
        # Lấy kết quả cho khuôn mặt đầu tiên (thường là khuôn mặt lớn nhất)
        first_face_result = results[0]
        
        # Trích xuất vị trí khuôn mặt (Bounding Box)
        (x, y, w, h) = first_face_result['box']
        
        # Trích xuất Cảm xúc Dominant
        emotions = first_face_result['emotions']
        dominant_emotion = max(emotions, key=emotions.get)
        
        # 3. Hiển thị Khuôn mặt và Kết quả
        
        # Vẽ hình chữ nhật quanh khuôn mặt
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        
        # Đặt chữ lên trên khuôn mặt
        text = f"Emotion: {dominant_emotion.capitalize()} ({emotions[dominant_emotion]:.2f})"
        cv2.putText(frame, text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2, cv2.LINE_AA)
        
        # Tùy chọn: Hiển thị điểm số cho tất cả cảm xúc (phức tạp hơn)
        
    # 4. Hiển thị Khung hình
    cv2.imshow('Real-time Facial Emotion Detection', frame)
    
    # 5. Phím thoát
    # Nhấn 'q' hoặc ESC để thoát khỏi vòng lặp
    if cv2.waitKey(1) & 0xFF == ord('q') or cv2.waitKey(1) & 0xFF == 27:
        break

# --- 3. DỌN DẸP ---
cap.release()
cv2.destroyAllWindows()
print("Dừng chương trình.")