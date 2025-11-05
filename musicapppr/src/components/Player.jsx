import React, { useContext } from "react"
import { assets } from "../assets/assets"
import { PlayerContext } from "../context/PlayerContext"

const Player = () => {
    const { track, seekBar, seekBg, playStatus, play, pause, time, previous, next, seekSong,
        volume, setVolume, isMuted, toggleMute, isShuffled, toggleShuffle, loopMode, toggleLoop, isQueueOpen, toggleQueue, playerView, togglePlayerView
    } = useContext(PlayerContext);
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
    return track ? (
        <div className="h-[10%] bg-black flex justify-between items-center text-white px-4">

            {/* -------------------- PHẦN TRÁI -------------------- */}
            <div className="hidden lg:flex items-center gap-4">
                <img className="w-12" src={track.image} alt="" />
                <div>
                    <p>{track.name}</p>
                    <p>{track.desc.slice(0, 12)}</p>
                </div>
            </div>

            {/* -------------------- PHẦN GIỮA (CONTROLS) -------------------- */}
            <div className="flex flex-col items-center gap-1 m-auto">
                {/* HÀNG NÚT CHÍNH */}
                <div className="flex gap-4">
                    {/* Nút SHUFFLE */}
                    <img
                        onClick={toggleShuffle}
                        className={`w-4 cursor-pointer ${isShuffled ? 'opacity-100 text-green-500' : 'opacity-70 hover:opacity-100'}`}
                        src={assets.shuffle_icon}
                        alt="Shuffle"
                    />

                    <img onClick={previous} className="w-4 cursor-pointer opacity-70 hover:opacity-100" src={assets.prev_icon} alt="Previous" />

                    {/* Nút PLAY/PAUSE */}
                    {playStatus
                        ? <img onClick={pause} className="w-4 cursor-pointer" src={assets.pause_icon} alt="Pause" />
                        : <img onClick={play} className="w-4 cursor-pointer" src={assets.play_icon} alt="Play" />}

                    <img onClick={next} className="w-4 cursor-pointer opacity-70 hover:opacity-100" src={assets.next_icon} alt="Next" />

                    {/* Nút LOOP */}
                    <img
                        onClick={toggleLoop}
                        className={`w-4 cursor-pointer ${loopMode !== 'none' ? 'opacity-100 text-green-500' : 'opacity-70 hover:opacity-100'}`}
                        src={getLoopIcon()}
                        alt="Loop"
                    />
                </div>

                {/* Thanh Seekbar */}
                <div className="flex items-center gap-5">
                    <p>{time.currentTime.minute}:{formatTime(time.currentTime.second)}</p>
                    <div ref={seekBg} onClick={seekSong} className="w-[60vw] max-w-[500px] bg-gray-300 rounded-b-full cursor-pointer">
                        <hr ref={seekBar} className="h-1 border-none w-0 bg-green-800 rounded-b-full" />
                    </div>
                    <p>{time.totalTime.minute}:{formatTime(time.totalTime.second)}</p>
                </div>
            </div>

            {/* -------------------- PHẦN PHẢI (VOLUME & UTILS) -------------------- */}
            <div className="hidden lg:flex items-center gap-2 opacity-75">

                {/* Nút QUEUE (Đã triển khai toggle state) */}
                <img
                    onClick={toggleQueue}
                    className={`w-4 cursor-pointer ${isQueueOpen ? 'opacity-100 text-green-500' : 'opacity-70 hover:opacity-100'}`}
                    src={assets.queue_icon}
                    alt="Queue"
                />

                {/* Icon Loa (Điều khiển Mute) */}
                <img
                    className="w-4 cursor-pointer hover:opacity-100"
                    src={isMuted || volume < 0.05 ? assets.volume_icon_mute : assets.volume_icon}
                    alt="Volume"
                    onClick={toggleMute}
                />

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

                <img
                    onClick={() => togglePlayerView('mini')}
                    className={`w-4 cursor-pointer hover:opacity-100 ${playerView === 'mini' ? 'text-green-500' : 'opacity-70'}`}
                    src={assets.mini_player_icon}
                    alt="Mini Player"
                />

                {/* 2. NÚT ZOOM (Chuyển sang chế độ full) */}
                <img
                    onClick={() => togglePlayerView('full')}
                    className={`w-4 cursor-pointer hover:opacity-100 ${playerView === 'full' ? 'text-green-500' : 'opacity-70'}`}
                    src={assets.zoom_icon}
                    alt="Zoom"
                />

            </div>
            {/* --------------------------------------------------------------------- */}
        </div>
    ) : null
}
export default Player