import React, { useContext, useState } from "react"; // Thêm useState nếu cần local state
import { PlayerContext } from '../context/PlayerContext';
import { assets } from '../assets/assets';

const FullScreenPlayer = () => {
    // Lấy tất cả state và hàm cần thiết từ Context
    const {
        track, playStatus, play, pause, time, previous, next, seekSong, songsData,
        togglePlayerView, volume, setVolume, toggleMute, isMuted, isShuffled, toggleShuffle,
        loopMode, toggleLoop, toggleQueue, isQueueOpen, audioRef,
        isLyricsVisible, toggleLyricsVisibility // Lấy state và hàm mới
    } = useContext(PlayerContext);

    // ... (logic formatTime, handleSeek, handleVolumeChange, getLoopIcon không thay đổi) ...
    const formatTime = (value) => String(Math.floor(value)).padStart(2, '0');
    const handleSeek = (e) => {
        if (audioRef.current && e.currentTarget) {
            const width = e.currentTarget.offsetWidth;
            const clickX = e.nativeEvent.offsetX;
            audioRef.current.currentTime = (clickX / width) * audioRef.current.duration;
        }
    };
    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value) / 100;
        setVolume(newVolume);
    };
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
        <div className="flex h-full bg-[#1e1e1e] text-white overflow-hidden">

            {/* 1. KHU VỰC THÔNG TIN BÀI HÁT CHÍNH (Chiếm 2/3 màn hình) */}
            <div className="flex flex-col items-center justify-center p-8 w-2/3 relative">

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

                </button>


                {/* CONTENT AREA: ẢNH BÌA HOẶC LỜI BÀI HÁT */}
                <div className="flex flex-col items-center justify-center flex-1 w-full max-w-lg mt-12 mb-8">

                    {/* A. HIỂN THỊ LỜI BÀI HÁT */}
                    {isLyricsVisible && track.lyrics ? (
                        <div className="w-full h-full p-6 bg-black/50 rounded-lg overflow-y-auto text-lg leading-relaxed">
                            <p className="whitespace-pre-wrap">{track.lyrics}</p>
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


                {/* Thanh điều khiển chính (Cố định ở dưới) */}
                <div className="w-full max-w-lg mt-auto pb-4"> {/* mt-auto đẩy xuống dưới */}
                    {/* Thanh Seekbar */}
                    <div className="flex items-center gap-4 w-full">
                        <p className="text-sm">{time.currentTime.minute}:{formatTime(time.currentTime.second)}</p>
                        <div
                            onClick={handleSeek}
                            className="flex-1 h-2 bg-gray-600 rounded-full cursor-pointer"
                        >
                            <div
                                style={{ width: `${(audioRef.current?.currentTime / audioRef.current?.duration) * 100 || 0}%` }}
                                className="h-2 bg-green-500 rounded-full"
                            />
                        </div>
                        <p className="text-sm">{time.totalTime.minute}:{formatTime(time.totalTime.second)}</p>
                    </div>

                    {/* Nút Điều Khiển */}
                    <div className="flex justify-center items-center gap-8 mt-6 text-gray-400">
                        <img onClick={toggleShuffle} className={`w-5 cursor-pointer ${isShuffled ? 'text-green-500' : 'opacity-70'}`} src={assets.shuffle_icon} alt="Shuffle" />
                        <img onClick={previous} className="w-6 cursor-pointer opacity-80 hover:opacity-100" src={assets.prev_icon} alt="Previous" />

                        {playStatus
                            ? <img onClick={pause} className="w-10 cursor-pointer" src={assets.pause_icon_large || assets.pause_icon} alt="Pause" />
                            : <img onClick={play} className="w-10 cursor-pointer" src={assets.play_icon_large || assets.play_icon} alt="Play" />}

                        <img onClick={next} className="w-6 cursor-pointer opacity-80 hover:opacity-100" src={assets.next_icon} alt="Next" />
                        <img onClick={toggleLoop} className={`w-5 cursor-pointer ${loopMode !== 'none' ? 'text-green-500' : 'opacity-70'}`} src={getLoopIcon()} alt="Loop" />
                    </div>

                    {/* Điều khiển Volume */}
                    <div className="flex justify-center items-center gap-2 mt-4 text-sm">
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
            <div className={`w-1/3 p-6 border-l border-gray-700 overflow-y-auto`}>
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