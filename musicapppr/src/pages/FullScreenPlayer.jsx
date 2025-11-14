import React, { useContext } from "react";
import { PlayerContext } from '../context/PlayerContext';
import { assets } from '../assets/assets';
import { toast } from 'react-toastify';

const FullScreenPlayer = () => {
    // Lấy tất cả state và hàm cần thiết từ Context
    const {
        track, playStatus, play, pause, time, previous, next, seekSong, songsData,
        togglePlayerView, volume, setVolume, toggleMute, isMuted, isShuffled, toggleShuffle,
        loopMode, toggleLoop, toggleQueue, isQueueOpen, audioRef,
        isLyricsVisible, toggleLyricsVisibility
    } = useContext(PlayerContext);

    // Hàm định dạng thời gian
    const formatTime = (value) => String(Math.floor(value)).padStart(2, '0');

    // Hàm xử lý Seekbar
    const handleSeek = (e) => {
        if (audioRef.current && e.currentTarget) {
            const width = e.currentTarget.offsetWidth;
            const clickX = e.nativeEvent.offsetX;
            audioRef.current.currentTime = (clickX / width) * audioRef.current.duration;
        }
    };

    // Hàm xử lý Volume
    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value) / 100;
        setVolume(newVolume);
    };

    // Hàm lấy icon Loop
    const getLoopIcon = () => {
        if (loopMode === 'track') return assets.loop_icon_one;
        if (loopMode === 'context') return assets.loop_icon_active;
        return assets.loop_icon;
    };

    if (!track) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-[#121212] text-white">
                <p>Không có bài hát nào đang phát.</p>
                <button
                    onClick={() => togglePlayerView('mini')}
                    className="mt-4 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                >
                    Quay lại
                </button>
            </div>
        );
    }


    return (
        // Container chính: h-full để lấp đầy toàn bộ khu vực flex-1
        <div className="flex h-full bg-[#1e1e1e] text-white overflow-hidden">

            {/* 1. KHU VỰC THÔNG TIN BÀI HÁT CHÍNH (Chiếm 2/3 màn hình) */}
            {/* Dùng justify-start để nội dung bắt đầu từ trên xuống và dùng mt-auto đẩy controls xuống dưới */}
            <div className="flex flex-col items-center justify-start p-8 w-2/3 relative h-full">

                {/* Nút Quay Lại/Đóng */}
                <button
                    onClick={() => togglePlayerView('mini')}
                    className="absolute top-4 left-4 text-white text-sm opacity-70 hover:opacity-100 flex items-center"
                >
                    Đóng (Mini View)
                </button>

                {/* Nút Toggle Lyrics (MIC Icon) */}
                <button
                    onClick={toggleLyricsVisibility}
                    className={`absolute top-4 right-4 p-2 rounded-full ${isLyricsVisible ? 'bg-green-600' : 'bg-gray-700/50'} hover:bg-gray-600`}
                >
                    <img src={assets.mic_icon} alt="Lyrics" className="w-4 h-4" />
                </button>


                {/* CONTENT AREA (Tên bài hát và Lyrics/Ảnh) */}
                {/* Giảm kích thước dọc, căn giữa và tạo khoảng trống phía trên (mt-12) */}
                <div className="flex flex-col items-center flex-shrink-0 w-full max-w-xl mx-auto mt-12">

                    {/* A. HIỂN THỊ LỜI BÀI HÁT (Giảm kích thước, Căn giữa, Cuộn) */}
                    {isLyricsVisible && track.lyrics ? (
                        // ✅ FIX: Giới hạn chiều cao cố định (h-[60vh]) để tạo khoảng trống dọc
                        <div className="w-full h-[60vh] max-w-3xl p-6 bg-black/60 backdrop-blur-sm rounded-xl shadow-lg text-center flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
                            <h3 className="text-2xl font-bold text-green-400 mb-4">Lời Bài Hát</h3>

                            {/* Khu vực cuộn chính: Dùng flex-1 để chiếm hết chiều cao còn lại và cho phép cuộn */}
                            <div className="flex-1 overflow-y-auto pr-4">
                                <p className="whitespace-pre-wrap text-xl leading-relaxed text-gray-200 text-center">
                                    {track.lyrics}
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* B. HIỂN THỊ ẢNH BÌA (Mặc định) */
                        <>
                            <div className="w-[350px] h-[350px] shadow-2xl rounded-lg">
                                <img
                                    src={track.image || assets.default_album_art}
                                    alt={track.name}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </div>

                            {/* Tên Bài Hát & Nghệ Sĩ */}
                            <div className="text-center mt-8">
                                <h1 className="text-4xl font-bold">{track.name}</h1>
                                <p className="text-xl text-gray-400 mt-2">{track.artist?.name || 'Nghệ sĩ không rõ'}</p>
                            </div>
                        </>
                    )}
                </div>
                {/* END CONTENT AREA */}

                {/* --- KHU VỰC CONTROLS CỐ ĐỊNH Ở DƯỚI CÙNG (Dùng mt-auto) --- */}
                <div className="w-full max-w-lg mt-auto pb-4">

                    {/* Nút Điều Khiển Chính (Shuffle, Play/Pause, Loop) */}
                    <div className="flex justify-center items-center gap-8 mt-6 text-gray-400">
                        <img onClick={toggleShuffle} className={`w-5 cursor-pointer ${isShuffled ? 'text-green-500' : 'opacity-70'}`} src={assets.shuffle_icon} alt="Shuffle" />
                        <img onClick={previous} className="w-6 cursor-pointer opacity-80 hover:opacity-100" src={assets.prev_icon} alt="Previous" />
                        {playStatus
                            ? <img onClick={pause} className="w-10 cursor-pointer" src={assets.pause_icon_large || assets.pause_icon} alt="Pause" />
                            : <img onClick={play} className="w-10 cursor-pointer" src={assets.play_icon_large || assets.play_icon} alt="Play" />}
                        <img onClick={next} className="w-6 cursor-pointer opacity-80 hover:opacity-100" src={assets.next_icon} alt="Next" />
                        <img onClick={toggleLoop} className={`w-5 cursor-pointer ${loopMode !== 'none' ? 'text-green-500' : 'opacity-70'}`} src={getLoopIcon()} alt="Loop" />
                    </div>

                    {/* Thanh Seekbar (Thời lượng) */}
                    <div className="flex items-center gap-4 w-full mt-4">
                        <p className="text-sm">{time.currentTime.minute}:{formatTime(time.currentTime.second)}</p>
                        <div onClick={handleSeek} className="flex-1 h-2 bg-gray-600 rounded-full cursor-pointer">
                            <div style={{ width: `${(audioRef.current?.currentTime / audioRef.current?.duration) * 100 || 0}%` }} className="h-2 bg-green-500 rounded-full" />
                        </div>
                        <p className="text-sm">{time.totalTime.minute}:{formatTime(time.totalTime.second)}</p>
                    </div>

                    {/* Điều khiển Volume (Độ to) */}
                    <div className="flex justify-center items-center gap-2 mt-4 text-sm w-full">
                        <img
                            className="w-4 cursor-pointer"
                            src={isMuted || volume < 0.05 ? assets.volume_icon_mute : assets.volume_icon}
                            alt="Volume"
                            onClick={toggleMute}
                        />
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={isMuted ? 0 : volume * 100}
                            onChange={handleVolumeChange}
                            className="w-32 h-1 cursor-pointer accent-green-500"
                        />
                    </div>
                </div>

            </div>

            {/* 2. KHU VỰC DANH SÁCH CHỜ (QUEUE) (Chiếm 1/3 màn hình) */}
            {/* ✅ FIX: Thêm pt-6 để tạo khoảng cách với trần trên */}
            <div className={`w-1/3 p-6 border-l border-gray-700 overflow-y-auto pt-6`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Danh Sách Phát</h2>
                    <button onClick={toggleQueue} className="text-gray-400 hover:text-white">
                        {isQueueOpen ? 'Đóng' : 'Mở'}
                    </button>
                </div>

                {songsData.map((song, index) => (
                    <div
                        key={song._id}
                        onClick={() => { /* Logic phát bài hát này */ }}
                        className={`flex items-center p-2 rounded-lg cursor-pointer transition duration-150 ${track._id === song._id ? 'bg-green-600/30' : 'hover:bg-gray-700'}`}
                    >
                        <img src={song.image} alt={song.name} className="w-10 h-10 object-cover rounded-md mr-3" />
                        <div>
                            <p className={`font-medium ${track._id === song._id ? 'text-white' : 'text-gray-200'}`}>{song.name}</p>
                            <p className="text-xs text-gray-400">{song.artist?.name || 'N/A'}</p>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default FullScreenPlayer;