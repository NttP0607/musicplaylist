import React, { useState, useRef, useEffect, useCallback, useContext, createContext } from 'react';
import axios from 'axios';
import { Play, Pause, Mic, FileText, Camera, RefreshCcw, Loader2, SkipForward, SkipBack, Shuffle, Repeat, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

// === 1. ASSETS (Icons cho Component Player) ===
// Định nghĩa các icon cần thiết cho component Player của bạn
const assets = {
    play_icon: <Play size={16} fill="white" className="text-white" />,
    pause_icon: <Pause size={16} fill="black" className="text-black" />,
    prev_icon: <SkipBack size={16} />,
    next_icon: <SkipForward size={16} />,
    shuffle_icon: <Shuffle size={16} />,
    loop_icon: <Repeat size={16} className="opacity-70" />,
    loop_icon_active: <Repeat size={16} className="text-green-500" />,
    loop_icon_one: <Repeat size={16} className="text-green-500 rotate-90" />,
    queue_icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 11h7a2 2 0 010 4h-7"></path><path d="M7 6v12"></path><path d="M10 9l-3-3-3 3"></path><path d="M10 15l-3 3-3-3"></path></svg>,
    volume_icon: <Volume2 size={16} />,
    volume_icon_mute: <VolumeX size={16} />,
    mini_player_icon: <Minimize size={16} />,
    zoom_icon: <Maximize size={16} />,
};

// API base
const API_BASE_URL = 'http://localhost:8000/api/emotion';

// Hàm định dạng thời lượng
const formatDuration = (seconds) => {
    if (typeof seconds !== 'number' || seconds < 0) return '--:--';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

// === 2. PLAYER CONTEXT KHAI BÁO (Export để các component khác có thể sử dụng) ===
export const PlayerContext = createContext();


// === 3. PLAYER COMPONENT (Thanh điều khiển nhạc chính) ===
const Player = () => {
    // Lấy tất cả các hàm và state từ Context
    const { track, seekBar, seekBg, playStatus, play, pause, time, previous, next, seekSong,
        volume, setVolume, isMuted, toggleMute, isShuffled, toggleShuffle, loopMode, toggleLoop, isQueueOpen, toggleQueue, playerView, togglePlayerView
    } = useContext(PlayerContext);

    // Hàm xử lý âm lượng và định dạng thời gian
    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value) / 100;
        setVolume(newVolume);
    };
    const formatTime = (value) => String(Math.floor(value)).padStart(2, '0');
    const getLoopIcon = () => {
        if (loopMode === 'track') return assets.loop_icon_one;
        if (loopMode === 'context') return assets.loop_icon_active;
        return assets.loop_icon;
    };

    // Tên artist
    // FIX: Đảm bảo chuyển đổi track?.artist thành chuỗi
    const trackArtist = String(track?.artist || (track?.desc ? track.desc.slice(0, 12) : 'Artist Unknown'));

    return track ? (
        // THANH PLAYER CHÍNH: Đặt cố định ở cuối màn hình (Dùng thanh cũ của bạn)
        <div className="fixed bottom-0 left-0 right-0 h-[10%] bg-black flex justify-between items-center text-white px-4 z-50 shadow-2xl border-t border-gray-800">

            {/* -------------------- PHẦN TRÁI -------------------- */}
            <div className="hidden lg:flex items-center gap-4">
                <img className="w-12 h-12 object-cover rounded-md" src={track.image || 'https://placehold.co/48x48/1e293b/ffffff?text=♫'} alt="" />
                <div>
                    <p className='text-sm font-semibold'>{String(track.name)}</p>
                    <p className='text-xs text-gray-400'>{trackArtist}</p>
                </div>
            </div>

            {/* -------------------- PHẦN GIỮA (CONTROLS) -------------------- */}
            <div className="flex flex-col items-center gap-1 m-auto">
                {/* HÀNG NÚT CHÍNH */}
                <div className="flex gap-4 items-center">
                    {/* Nút SHUFFLE */}
                    <div
                        onClick={toggleShuffle}
                        className={`w-4 cursor-pointer ${isShuffled ? 'text-green-500' : 'opacity-70 hover:opacity-100'}`}
                        title="Shuffle"
                    >
                        {assets.shuffle_icon}
                    </div>

                    <div onClick={previous} className="w-4 cursor-pointer opacity-70 hover:opacity-100" title="Previous">
                        {assets.prev_icon}
                    </div>

                    {/* Nút PLAY/PAUSE */}
                    <div
                        onClick={playStatus ? pause : play}
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center cursor-pointer hover:scale-105 transition"
                        title={playStatus ? "Pause" : "Play"}
                    >
                        {playStatus ? assets.pause_icon : assets.play_icon}
                    </div>

                    <div onClick={next} className="w-4 cursor-pointer opacity-70 hover:opacity-100" title="Next">
                        {assets.next_icon}
                    </div>

                    {/* Nút LOOP */}
                    <div
                        onClick={toggleLoop}
                        className={`w-4 cursor-pointer ${loopMode !== 'none' ? 'text-green-500' : 'opacity-70 hover:opacity-100'}`}
                        title="Loop"
                    >
                        {getLoopIcon()}
                    </div>
                </div>

                {/* Thanh Seekbar */}
                <div className="flex items-center gap-5">
                    <p className='text-xs'>{time.currentTime.minute}:{formatTime(time.currentTime.second)}</p>
                    <div ref={seekBg} onClick={seekSong} className="w-[60vw] max-w-[500px] bg-gray-700 rounded-full h-1 cursor-pointer group">
                        <hr ref={seekBar} className="h-1 border-none w-0 bg-green-500 rounded-full group-hover:bg-green-300 transition-all duration-150" />
                    </div>
                    <p className='text-xs'>{time.totalTime.minute}:{formatTime(time.totalTime.second)}</p>
                </div>
            </div>

            {/* -------------------- PHẦN PHẢI (VOLUME & UTILS) -------------------- */}
            <div className="hidden lg:flex items-center gap-2 opacity-75">

                {/* Nút QUEUE */}
                <div
                    onClick={toggleQueue}
                    className={`w-4 cursor-pointer ${isQueueOpen ? 'text-green-500' : 'hover:opacity-100'}`}
                    title="Queue"
                >
                    {assets.queue_icon}
                </div>

                {/* Icon Loa (Điều khiển Mute) */}
                <div
                    className="w-4 cursor-pointer hover:opacity-100"
                    title={isMuted || volume < 0.05 ? "Unmute" : "Mute"}
                    onClick={toggleMute}
                >
                    {isMuted || volume < 0.05 ? assets.volume_icon_mute : assets.volume_icon}
                </div>

                {/* Thanh trượt âm lượng */}
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={isMuted ? 0 : volume * 100}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 cursor-pointer accent-green-500"
                />

                <div
                    onClick={() => togglePlayerView('mini')}
                    className={`w-4 cursor-pointer hover:opacity-100 ${playerView === 'mini' ? 'text-green-500' : 'opacity-70'}`}
                    title="Mini Player"
                >
                    {assets.mini_player_icon}
                </div>

                <div
                    onClick={() => togglePlayerView('full')}
                    className={`w-4 cursor-pointer hover:opacity-100 ${playerView === 'full' ? 'text-green-500' : 'opacity-70'}`}
                    title="Full Player"
                >
                    {assets.zoom_icon}
                </div>
            </div>
            {/* --------------------------------------------------------------------- */}
        </div>
    ) : null
}

// === 4. EMOTION ANALYZER COMPONENT (Đã Tích hợp PlayerContext) ===

const initialResult = {
    emotion: 'Neutral',
    genre: 'Pop',
    suggestions: [],
};

const EmotionAnalyzer = () => {
    // Lấy hàm và dữ liệu cần thiết từ context
    const playerContext = useContext(PlayerContext);
    const { track, playStatus, playNewQueue, currentQueue, queueTrackIndex } = playerContext;

    const [mode, setMode] = useState('text');
    const [inputText, setInputText] = useState('');
    const [result, setResult] = useState(initialResult);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    // Refs cho Camera, Canvas và Stream
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamInterval = useRef(null);
    const [cameraRunning, setCameraRunning] = useState(false);

    // Xử lý thông báo tạm thời
    const showMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
    };

    // Auto-start camera when mode === 'camera'
    useEffect(() => {
        if (mode === 'camera') {
            startCameraStream();
        } else {
            stopCameraStream();
        }
        return () => {
            stopCameraStream();
            if (streamInterval.current) {
                clearInterval(streamInterval.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    // Handle text submit
    const handleTextSubmit = async () => {
        if (!inputText.trim()) return;
        setIsLoading(true);
        setError(null);
        setResult(initialResult);
        try {
            const res = await axios.post(`${API_BASE_URL}/text`, { text: inputText });
            setResult(res.data);
            showMessage(`Phân tích thành công. Mood: ${res.data.emotion}`);
        } catch (err) {
            const serverError = err.response ? err.response.data.detail || "Lỗi Server" : "Lỗi kết nối Server AI.";
            setError(`Lỗi dự đoán văn bản: ${serverError}`);
            setResult(initialResult);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle file upload
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsLoading(true);
        setError(null);
        setResult(initialResult);
        try {
            const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setResult(response.data);
            showMessage(`Phân tích ảnh thành công. Mood: ${response.data.emotion}`);
        } catch (err) {
            const serverError = err.response ? err.response.data.detail || "Server Error" : "Lỗi kết nối Server AI.";
            setError(`Lỗi xử lý file ảnh: ${serverError}`);
            setResult(initialResult);
        } finally {
            setIsLoading(false);
            event.target.value = '';
        }
    };

    // === CAMERA LOGIC CẢI TIẾN (Đã sửa lỗi không dừng stream) ===
    const getScreenshotBase64 = useCallback(() => {
        // RÀNG BUỘC: Chỉ chụp nếu video đã sẵn sàng, không tạm dừng và không kết thúc.
        if (!videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended || videoRef.current.readyState !== 4) return null;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const width = video.videoWidth;
        const height = video.videoHeight;

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(video, 0, 0, width, height);
        const imageSrc = canvas.toDataURL('image/jpeg', 0.9);
        return imageSrc.split(',')[1];
    }, []);

    const startCameraStream = async () => {
        if (streamInterval.current) {
            clearInterval(streamInterval.current);
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            streamInterval.current = setInterval(continuousCaptureAndSend, 700);
            setCameraRunning(true);
            setError(null);
            showMessage("Camera Real-time đang chạy...");
        } catch (e) {
            setError("Không thể truy cập Camera. Vui lòng kiểm tra quyền.");
            console.error("Failed to start camera stream:", e);
        }
    };

    const stopCameraStream = () => {
        try {
            if (streamInterval.current) {
                clearInterval(streamInterval.current);
                streamInterval.current = null;
            }
            // Logic dừng tracks mạnh mẽ hơn
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject;
                if (stream && typeof stream.getTracks === 'function') {
                    const tracks = stream.getTracks();
                    tracks.forEach((t) => t.stop());
                }
                videoRef.current.srcObject = null;
            }
            setCameraRunning(false);
            showMessage("Đã dừng Camera Real-time.");
        } catch (e) {
            console.error("Error stopping stream:", e);
        }
    };

    const captureAndSend = async () => {
        if (isLoading) return;
        setIsLoading(true);
        setError(null);

        const base64Data = getScreenshotBase64();
        if (!base64Data) {
            setError("Không thể chụp ảnh. Đảm bảo camera đã sẵn sàng.");
            setIsLoading(false);
            return;
        }

        try {
            const res = await axios.post(`${API_BASE_URL}/stream`, { image_base64: base64Data });
            setResult(res.data);
            showMessage(`Mood hiện tại: ${res.data.emotion}`);
        } catch (err) {
            console.error("Lỗi API Stream:", err);
            setError("Lỗi khi gửi ảnh lên AI Server.");
        } finally {
            setIsLoading(false);
        }
    };

    const continuousCaptureAndSend = async () => {
        const base64Data = getScreenshotBase64();
        if (!base64Data) return;

        try {
            const res = await axios.post(`${API_BASE_URL}/stream`, { image_base64: base64Data });
            setResult(res.data);
        } catch (err) {
            console.error("Lỗi API Stream (Interval):", err);
        }
    };

    // === TÍCH HỢP PLAYER CONTEXT ===

    // Phát toàn bộ danh sách (gọi playNewQueue của Context)
    const handlePlayAll = () => {
        if (result.suggestions.length > 0) {
            playNewQueue(result.suggestions, 0);
        } else {
            showMessage("Không có bài hát nào trong danh sách gợi ý.");
        }
    };

    // Phát một bài hát đơn lẻ (gọi playNewQueue của Context)
    const handleSinglePlay = (index) => {
        if (result.suggestions.length > index) {
            playNewQueue(result.suggestions, index);
        }
    };

    // Kiểm tra xem bài hát này có đang được context phát không
    const isSongCurrent = (song, index) => {
        // Kiểm tra xem currentQueue có phải là danh sách gợi ý AI hay không
        const isAIQueue = currentQueue.length === result.suggestions.length && currentQueue[0]?.file === result.suggestions[0]?.file;

        // Nếu đúng là AI Queue, kiểm tra index hiện tại
        return isAIQueue && queueTrackIndex === index && playStatus;
    };

    // ===============================================

    // Render component
    return (
        // Thêm padding bottom để Player Control không che khuất nội dung
        <div className="p-4 md:p-8 bg-[#121212] min-h-screen text-white font-sans pb-[10vh] lg:pb-[12vh]">
            <h1 className="text-3xl font-extrabold mb-6 text-yellow-400 border-b border-gray-700 pb-2">
                Gợi ý Nhạc theo Cảm xúc AI
            </h1>

            <div className="flex flex-wrap gap-3 mb-8">
                <button
                    onClick={() => setMode('text')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition text-sm md:text-base ${mode === 'text' ? 'bg-yellow-500 text-black shadow-lg' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    <FileText size={18} /> Nhập Văn bản
                </button>
                <button
                    onClick={() => setMode('upload')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition text-sm md:text-base ${mode === 'upload' ? 'bg-yellow-500 text-black shadow-lg' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    <Camera size={18} /> Tải Ảnh
                </button>
                <button
                    onClick={() => setMode('camera')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition text-sm md:text-base ${mode === 'camera' ? 'bg-yellow-500 text-black shadow-lg' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    <Mic size={18} /> Camera Real-time
                </button>
            </div>

            <div className="bg-[#242424] p-6 rounded-xl shadow-2xl mb-8">
                {/* Message Box */}
                {message && (
                    <div className="bg-blue-600 text-white p-3 rounded-lg mb-4 text-center font-medium transition-opacity duration-300">
                        {message}
                    </div>
                )}
                {error && <p className="text-red-500 mb-4 font-semibold p-2 border border-red-500 rounded-lg">{error}</p>}

                {/* MODE: TEXT INPUT */}
                {mode === 'text' && (
                    <div className="flex flex-col gap-4">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Nhập cảm xúc hoặc suy nghĩ của bạn vào đây..."
                            className="p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            rows="4"
                        />
                        <button
                            onClick={handleTextSubmit}
                            disabled={isLoading || !inputText.trim()}
                            className="bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <RefreshCcw size={20} />}
                            {isLoading ? 'Đang phân tích...' : 'Phân tích & Gợi ý Nhạc'}
                        </button>
                    </div>
                )}

                {/* MODE: FILE UPLOAD */}
                {mode === 'upload' && (
                    <div className='flex flex-col items-center gap-4 p-4 border border-dashed border-gray-600 rounded-lg'>
                        <p className='text-gray-400'>Tải ảnh khuôn mặt rõ nét để phân tích cảm xúc (ví dụ: ảnh selfie):</p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isLoading}
                            className="w-full text-sm file:bg-yellow-500 file:text-black file:border-0 file:rounded-full file:py-2 file:px-4 file:mr-4 file:cursor-pointer disabled:opacity-50"
                        />
                        {isLoading && <p className="text-yellow-400 flex items-center gap-2"><Loader2 size={18} className="animate-spin" /> Đang tải lên và phân tích...</p>}
                    </div>
                )}

                {/* MODE: CAMERA STREAM (Sử dụng <video> và <canvas> gốc) */}
                {mode === 'camera' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden border-4 border-gray-600">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                            <canvas ref={canvasRef} style={{ display: 'none' }} />

                            <p className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-sm font-bold shadow-md">
                                Mood: {result.emotion}
                            </p>
                        </div>

                        <div className="flex gap-3 w-full max-w-md">
                            <button
                                onClick={stopCameraStream}
                                disabled={!cameraRunning}
                                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${cameraRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 opacity-50 cursor-not-allowed'}`}
                            >
                                Dừng Camera
                            </button>
                            <button
                                onClick={startCameraStream}
                                disabled={cameraRunning}
                                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${!cameraRunning ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-700 opacity-50 cursor-not-allowed'}`}
                            >
                                Bật Camera
                            </button>
                            <button
                                onClick={captureAndSend}
                                disabled={!cameraRunning || isLoading}
                                className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Gửi 1 Lần'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* SUGGESTION LIST */}
            <div className="mt-8">
                <div className='flex justify-between items-center mb-4'>
                    <h2 className="text-2xl font-bold">🎵 Gợi ý cho Mood: {result.emotion}</h2>
                    {result.suggestions.length > 0 && (
                        <button
                            onClick={handlePlayAll}
                            className='px-4 py-2 bg-green-500 text-black rounded-full font-bold hover:bg-green-600 transition flex items-center gap-2 shadow-md'
                        >
                            <Play size={20} />
                            Phát toàn bộ ({result.suggestions.length})
                        </button>
                    )}
                </div>

                {isLoading && <p className="text-yellow-400 flex items-center gap-2"><Loader2 size={20} className="animate-spin" /> Đang tìm kiếm nhạc...</p>}

                <div className="grid grid-cols-1 gap-2">
                    {result.suggestions.length > 0 ? (
                        result.suggestions.map((song, index) => (
                            <SongSuggestionCard
                                key={index}
                                song={song}
                                index={index + 1}
                                onPlay={handleSinglePlay}
                                isCurrent={isSongCurrent(song, index)}
                                isPlaying={playerContext.playStatus}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 col-span-full bg-[#181818] p-4 rounded-lg border border-gray-700">
                            {!isLoading && result.emotion !== 'Neutral'
                                ? `Không tìm thấy bài hát nào khớp với Mood "${result.emotion}".`
                                : 'Vui lòng chọn chế độ và bắt đầu phân tích để nhận gợi ý.'}
                        </p>
                    )}
                </div>
            </div>

            {/* PLAYER CONTROL BAR (Sử dụng thanh chính) */}
            {/* Thanh Player chỉ hiển thị khi có track được chọn */}
            {track && <Player />}

        </div>
    );
};

// === Card component ===
const SongSuggestionCard = ({ song, index, onPlay, isCurrent, isPlaying }) => {
    const songIndex = index - 1;

    return (
        <div className={`p-3 rounded-xl transition flex items-center justify-between shadow-lg border ${isCurrent ? 'bg-yellow-900 border-yellow-500' : 'bg-[#181818] border-transparent hover:bg-[#282828]'}`}>
            <div className='flex items-center gap-3 flex-1 min-w-0'>
                <p className={`text-lg w-5 text-right font-mono ${isCurrent ? 'text-yellow-300 font-bold' : 'text-gray-500'}`}>{index}.</p>
                {/* Image Placeholder/Thumbnail */}
                <img
                    src={song.image || 'https://placehold.co/60x60/333333/ffffff?text=♫'}
                    alt={String(song.name)}
                    className="w-14 h-14 object-cover rounded-md flex-shrink-0"
                    // Fallback cho ảnh bị lỗi
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/60x60/333333/ffffff?text=♫" }}
                />
                <div className='flex-1 min-w-0 truncate'>
                    <p className={`font-bold truncate text-base ${isCurrent ? 'text-white' : 'text-yellow-500'}`}>{String(song.name)}</p>
                    <p className={`text-sm truncate ${isCurrent ? 'text-gray-300' : 'text-gray-400'}`}>{String(song.artist || 'Nghệ sĩ không rõ')}</p>
                </div>
            </div>

            <div className='flex items-center gap-4 flex-shrink-0'>
                <p className='text-sm text-gray-500 hidden sm:block font-mono'>{formatDuration(song.duration)}</p>
                <button
                    onClick={() => onPlay(songIndex)}
                    className={`p-3 rounded-full hover:scale-110 transition shadow-lg ${isCurrent && isPlaying ? 'bg-red-500' : 'bg-green-500'}`}
                    title={isCurrent && isPlaying ? 'Dừng phát' : 'Phát bài này'}
                >
                    {isCurrent && isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" />}
                </button>
            </div>
        </div>
    );
};


// === ROOT APP COMPONENT (bao bọc EmotionAnalyzer trong Context Provider) ===
// Giả lập PlayerContextProvider trong cùng 1 file để đảm bảo tính runnable
const PlayerContextProvider = ({ children }) => {

    const audioRef = useRef();
    const seekBg = useRef();
    const seekBar = useRef();

    // Thay đổi URL nếu cần, dựa trên cấu hình backend thực tế của bạn
    const url = "http://localhost:4000";

    const [songsData, setSongsData] = useState([]);
    const [albumsData, setAlbumsData] = useState([]);

    const [currentQueue, setCurrentQueue] = useState([]);
    const [queueTrackIndex, setQueueTrackIndex] = useState(-1);

    const [track, setTrack] = useState(null);
    const [playStatus, setPlayStatus] = useState(false);

    const [volume, setVolumeState] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isShuffled, setIsShuffled] = useState(false);
    const [loopMode, setLoopMode] = useState('none');
    const [isQueueOpen, setIsQueueOpen] = useState(false);
    const [playerView, setPlayerView] = useState('mini');
    const [isLyricsVisible, setIsLyricsVisible] = useState(false);
    const [time, setTime] = useState({
        currentTime: { second: 0, minute: 0 },
        totalTime: { second: 0, minute: 0 }
    });

    const togglePlayerView = (view = null) => { setPlayerView(view || (prev => (prev === 'mini' ? 'full' : 'mini'))); };
    const toggleLyricsVisibility = () => setIsLyricsVisible(prev => !prev);
    const toggleShuffle = () => { setIsShuffled(prev => !prev); };
    const toggleQueue = () => { setIsQueueOpen(prev => !prev); };

    const setVolume = (newVolume) => {
        if (audioRef.current) { audioRef.current.volume = newVolume; setVolumeState(newVolume); setIsMuted(newVolume === 0); }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            if (isMuted) { const unmuteVolume = volume > 0.01 ? volume : 0.5; audioRef.current.volume = unmuteVolume; setVolumeState(unmuteVolume); setIsMuted(false); }
            else { audioRef.current.volume = 0; setIsMuted(true); }
        }
    };

    const toggleLoop = () => {
        let newMode = loopMode === 'none' ? 'track' : (loopMode === 'track' ? 'context' : 'none');
        audioRef.current.loop = newMode === 'track';
        setLoopMode(newMode);
    };

    const play = () => { if (track) { audioRef.current.play(); setPlayStatus(true); } }
    const pause = () => { audioRef.current.pause(); setPlayStatus(false); }

    const playRandom = useCallback(() => {
        if (currentQueue.length <= 1) return;
        let randomIndex;
        do { randomIndex = Math.floor(Math.random() * currentQueue.length); } while (track && currentQueue[randomIndex].file === track.file);
        setQueueTrackIndex(randomIndex);
        setTrack(currentQueue[randomIndex]);
        setPlayStatus(true);
    }, [currentQueue, track]);

    const previous = () => {
        if (!track || currentQueue.length === 0) return;
        let newIndex = queueTrackIndex - 1;
        if (newIndex < 0) { newIndex = currentQueue.length - 1; }
        setQueueTrackIndex(newIndex);
        setTrack(currentQueue[newIndex]);
        setPlayStatus(true);
    }

    const next = useCallback(() => {
        if (!track || currentQueue.length === 0) return;
        if (isShuffled) { playRandom(); return; }

        let newIndex = queueTrackIndex + 1;

        if (newIndex >= currentQueue.length) {
            if (loopMode === 'context') { newIndex = 0; }
            else { setPlayStatus(false); setQueueTrackIndex(0); setTrack(currentQueue[0]); return; }
        }
        setQueueTrackIndex(newIndex);
        setTrack(currentQueue[newIndex]);
        setPlayStatus(true);

    }, [currentQueue, queueTrackIndex, track, isShuffled, loopMode, playRandom]);

    const seekSong = (e) => {
        if (audioRef.current && seekBg.current) {
            audioRef.current.currentTime = ((e.nativeEvent.offsetX / seekBg.current.offsetWidth) * audioRef.current.duration);
        }
    }

    const playNewQueue = (newSongs, startIndex = 0) => {
        if (newSongs.length === 0) { setPlayStatus(false); setCurrentQueue([]); setTrack(null); setQueueTrackIndex(-1); return; }
        setCurrentQueue(newSongs);
        const songToPlay = newSongs[startIndex];
        setTrack(songToPlay);
        setQueueTrackIndex(startIndex);
        setPlayStatus(true);
    };

    const playWithId = (id) => {
        const selectedTrack = songsData.find(item => item._id === id);
        if (selectedTrack) {
            const index = songsData.findIndex(item => item._id === id);
            setCurrentQueue(songsData);
            setQueueTrackIndex(index);
            setTrack(selectedTrack);
            setPlayStatus(true);
        }
    }

    const getSongsData = async () => {
        try {
            const response = await axios.get(`${url}/api/song/list`);
            const fetchedSongs = response.data.songs;
            setSongsData(fetchedSongs);

            if (fetchedSongs.length > 0) {
                setCurrentQueue(fetchedSongs);
                setQueueTrackIndex(0);
                setTrack(fetchedSongs[0]);
            }
        } catch (error) { console.error("Error fetching songs:", error); }
    }
    const getAlbumsData = async () => {
        try {
            const response = await axios.get(`${url}/api/album/list`);
            setAlbumsData(response.data.albums);
        } catch (error) { console.error("Error fetching albums:", error); }
    }

    useEffect(() => {
        if (track) {
            audioRef.current.src = track.file;
            if (playStatus) { audioRef.current.play().catch(e => console.error("Auto-play failed:", e)); } else { audioRef.current.pause(); }
            if (seekBar.current) { seekBar.current.style.width = "0%"; }
        }
        if (audioRef.current) { audioRef.current.volume = isMuted ? 0 : volume; }
    }, [track, playStatus, volume, isMuted]);

    useEffect(() => {
        const audio = audioRef.current;
        const updateTime = () => {
            if (audio.readyState >= 1) {
                const current = audio.currentTime;
                const total = audio.duration;
                if (seekBar.current && total > 0) { seekBar.current.style.width = (Math.floor(current / total * 100)) + "%"; }
                setTime({
                    currentTime: { second: Math.floor(current % 60), minute: Math.floor(current / 60) },
                    totalTime: { second: Math.floor(total % 60), minute: Math.floor(total / 60) }
                });
            }
        };

        if (audio) {
            audio.ontimeupdate = updateTime;
            audio.onended = (loopMode !== 'track') ? next : null;
        }
        return () => { if (audio) { audio.ontimeupdate = null; audio.onended = null; } };
    }, [next, loopMode]);

    useEffect(() => { getSongsData(); getAlbumsData(); }, [])


    const contextValue = {
        audioRef, seekBar, seekBg,
        track, setTrack, playStatus, setPlayStatus, time, setTime, play, pause,
        playWithId, previous, next, seekSong, songsData, albumsData,
        volume, setVolume, isMuted, toggleMute, isShuffled, toggleShuffle, loopMode, toggleLoop,
        isQueueOpen, toggleQueue, playerView, setPlayerView, togglePlayerView,
        isLyricsVisible, toggleLyricsVisibility,
        currentQueue, queueTrackIndex, playNewQueue
    }

    return (
        <PlayerContext.Provider value={contextValue}>
            {children}
            {track && <audio ref={audioRef} src={track.file}></audio>}
        </PlayerContext.Provider>
    );
}


const App = () => (
    <PlayerContextProvider>
        <EmotionAnalyzer />
    </PlayerContextProvider>
);

export default App;