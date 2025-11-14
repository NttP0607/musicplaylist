import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
// Giả định bạn có PlayerContext để điều khiển nhạc toàn cục
// import { PlayerContext } from '../context/PlayerContext'; 

// --- CẤU HÌNH API ---
const API_BASE_URL = 'http://localhost:8000/api/emotion';

// --- INTERFACE KẾT QUẢ ---
const initialResult = {
    emotion: 'Neutral',
    genre: 'Pop',
    suggestions: [],
};

// --- HÀM HELPER: CHUYỂN ĐỔI GIÂY SANG PHÚT:GIÂY ---
const formatDuration = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};


// --- COMPONENT CHÍNH ---
const EmotionAnalyzer = () => {
    const [mode, setMode] = useState('text');
    const [inputText, setInputText] = useState('');
    const [result, setResult] = useState(initialResult);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // const { onPlayQueue } = useContext(PlayerContext); // Giả sử sử dụng Context này

    const webcamRef = useRef(null);
    const streamInterval = useRef(null);

    // --- EFFECT QUẢN LÝ CAMERA STREAM (ĐÃ SỬA LỖI DỪNG) ---
    useEffect(() => {
        // Hàm cleanup: đảm bảo dừng interval khi component unmount hoặc mode thay đổi
        return () => {
            stopCameraStream();
        };
    }, [mode]); // Kích hoạt khi mode thay đổi

    // --- HÀM PHÁT NHẠC (Giả định gọi Context/Hàm global) ---
    const handlePlayAll = () => {
        if (result.suggestions.length > 0) {
            // ⚠️ THAY THẾ bằng hàm phát nhạc thực tế của bạn
            // Ví dụ: onPlayQueue(result.suggestions); 
            console.log(`Đã gửi ${result.suggestions.length} bài hát Mood: ${result.emotion} vào hàng đợi phát.`);
            alert(`Đã gửi ${result.suggestions.length} bài hát Mood: ${result.emotion} vào hàng đợi phát.`);
        }
    };

    // --- HÀM GỌI API (VĂN BẢN) ---
    const handleTextSubmit = async () => {
        if (!inputText.trim()) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/text`, { text: inputText });
            setResult(response.data);
        } catch (err) {
            const serverError = err.response ? err.response.data.detail || "Lỗi Server" : "Lỗi kết nối Server AI.";
            setError(`Lỗi dự đoán văn bản: ${serverError}`);
            setResult(initialResult);
        } finally {
            setIsLoading(false);
        }
    };

    // --- HÀM GỌI API (UPLOAD) ---
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/upload`, formData);
            setResult(response.data);
        } catch (err) {
            const serverError = err.response ? err.response.data.detail || "Server Error" : "Lỗi kết nối Server AI.";
            setError(`Lỗi xử lý file ảnh: ${serverError}`);
            setResult(initialResult);
        } finally {
            setIsLoading(false);
        }
    };

    // --- HÀM GỌI API (STREAM) ---
    const captureAndSend = async () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (!imageSrc) return;

            const base64Data = imageSrc.split(',')[1];
            try {
                const response = await axios.post(`${API_BASE_URL}/stream`, { image_base64: base64Data });
                setResult(response.data);
            } catch (err) {
                console.error("Lỗi API Stream:", err);
            }
        }
    };

    // --- QUẢN LÝ CAMERA ---
    const startCameraStream = () => {
        if (streamInterval.current) clearInterval(streamInterval.current);
        if (mode === 'camera') { // Chỉ bắt đầu nếu đang ở chế độ camera
            streamInterval.current = setInterval(captureAndSend, 500);
        }
    };

    const stopCameraStream = () => {
        if (streamInterval.current) {
            clearInterval(streamInterval.current);
            streamInterval.current = null;
            // Đặt lại kết quả về Neutral khi dừng stream
            setResult(initialResult);
            console.log("Stream stopped.");
        }
    };

    // --- RENDER UI ---
    return (
        <div className="p-8 bg-[#121212] min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-6 text-yellow-400">Gợi ý Nhạc theo Cảm xúc AI</h1>
            <div className="flex gap-4 mb-8 border-b border-gray-700 pb-4">
                {/* Nút chuyển MODE */}
                <button onClick={() => setMode('text')} className={`px-4 py-2 rounded-full font-semibold transition ${mode === 'text' ? 'bg-yellow-500 text-black' : 'bg-gray-700 hover:bg-gray-600'}`}>📝 Nhập Văn bản</button>
                <button onClick={() => setMode('upload')} className={`px-4 py-2 rounded-full font-semibold transition ${mode === 'upload' ? 'bg-yellow-500 text-black' : 'bg-gray-700 hover:bg-gray-600'}`}>📸 Tải Ảnh Khuôn mặt</button>
                <button onClick={() => setMode('camera')} className={`px-4 py-2 rounded-full font-semibold transition ${mode === 'camera' ? 'bg-yellow-500 text-black' : 'bg-gray-700 hover:bg-gray-600'}`}>🎥 Camera Real-time</button>
            </div>

            {/* KHỐI INPUT */}
            <div className="bg-[#242424] p-6 rounded-lg mb-8">
                {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}

                {mode === 'text' && (
                    <div className="flex flex-col gap-4">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Nhập cảm xúc hoặc suy nghĩ của bạn vào đây..."
                            className="p-3 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            rows="4"
                        ></textarea>
                        <button
                            onClick={handleTextSubmit}
                            disabled={isLoading || !inputText.trim()}
                            className="bg-yellow-500 text-black font-bold py-2 rounded-lg hover:bg-yellow-600 transition disabled:opacity-50"
                        >
                            {isLoading ? 'Đang phân tích...' : 'Phân tích & Gợi ý Nhạc'}
                        </button>
                    </div>
                )}

                {mode === 'upload' && (
                    <div className='flex flex-col items-center gap-3'>
                        <p className='text-gray-400'>Chọn ảnh khuôn mặt để phân tích:</p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isLoading}
                            className="file:bg-yellow-500 file:text-black file:border-0 file:rounded-full file:py-2 file:px-4 file:mr-4 file:cursor-pointer disabled:opacity-50"
                        />
                    </div>
                )}

                {mode === 'camera' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-[480px] h-[360px] bg-black rounded-lg overflow-hidden border-2 border-yellow-500">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                width={480}
                                height={360}
                                videoConstraints={{ facingMode: "user" }}
                            />
                            <p className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded text-sm font-semibold">
                                {result.emotion !== 'Neutral' ? `Cảm xúc: ${result.emotion}` : 'Đang tìm kiếm khuôn mặt...'}
                            </p>
                        </div>
                        <button
                            onClick={stopCameraStream}
                            className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition"
                        >
                            Dừng Camera
                        </button>
                    </div>
                )}
            </div>

            {/* KHỐI KẾT QUẢ GỢI Ý NHẠC */}
            <div className="mt-8">
                <div className='flex justify-between items-center mb-4'>
                    <h2 className="text-2xl font-bold">🎵 Gợi ý (Mood: {result.emotion} - Genre: {result.genre.toUpperCase()})</h2>
                    {result.suggestions.length > 0 && (
                        <button onClick={handlePlayAll} className='px-4 py-2 bg-green-500 text-black rounded-full font-bold hover:bg-green-600 transition flex items-center gap-2'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 6v12l10-6z" />
                            </svg>
                            Phát toàn bộ
                        </button>
                    )}
                </div>

                {isLoading && <p>Đang tải danh sách nhạc...</p>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.suggestions.length > 0 ? (
                        result.suggestions.map((song, index) => (
                            <SongSuggestionCard key={index} song={song} index={index + 1} />
                        ))
                    ) : (
                        <p className="text-gray-500 col-span-full bg-[#181818] p-4 rounded-lg">
                            {!isLoading && result.emotion !== 'Neutral'
                                ? `Không tìm thấy bài hát nào khớp với Mood "${result.emotion}". Vui lòng kiểm tra dữ liệu MongoDB.`
                                : 'Vui lòng chọn chế độ và bắt đầu phân tích.'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT CON: HIỂN THỊ BÀI HÁT (ĐÃ NÂNG CẤP) ---
const SongSuggestionCard = ({ song, index }) => {
    // ⚠️ Giả định rằng bạn có thể gọi hàm phát nhạc ở đây
    const handleSinglePlay = () => {
        console.log(`Đang phát bài: ${song.name}`);
        // Thêm logic phát nhạc đơn (ví dụ: onPlay(song))
        alert(`Đang phát: ${song.name}`);
    };

    return (
        <div className="bg-[#181818] p-2 rounded-lg hover:bg-[#282828] transition flex items-center justify-between">
            <div className='flex items-center gap-3'>
                <p className='text-gray-500 text-lg w-4 text-right'>{index}</p>
                <img
                    src={song.image || 'https://placehold.co/50x50/1e293b/ffffff?text=♫'}
                    alt={song.name}
                    className="w-12 h-12 object-cover rounded-md"
                />
                <div className='flex-1 min-w-0'>
                    <p className="font-bold truncate text-sm">{song.name}</p>
                    <p className="text-xs text-gray-400 truncate">{song.artist || 'Nghệ sĩ không rõ'}</p>
                </div>
            </div>

            <div className='flex items-center gap-4'>
                <p className='text-sm text-gray-500 hidden sm:block'>{formatDuration(song.duration)}</p>
                <button
                    onClick={handleSinglePlay}
                    className='bg-green-500 text-black p-2 rounded-full hover:scale-105 transition'
                    title={`Phát ${song.name}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 6v12l10-6z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};


export default EmotionAnalyzer;