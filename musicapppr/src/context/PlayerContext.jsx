import { createContext, useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";


// Export Context
export const PlayerContext = createContext();

// Định nghĩa Component Provider
const PlayerContextProvider = (props) => {

    const audioRef = useRef();
    const seekBg = useRef();
    const seekBar = useRef();

    const url = "http://localhost:4000";

    const [songsData, setSongsData] = useState([]);
    const [albumsData, setAlbumsData] = useState([]);
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
        currentTime: {
            second: 0,
            minute: 0
        },
        totalTime: {
            second: 0,
            minute: 0
        }
    })
    const togglePlayerView = (view = null) => {
        if (view) {
            setPlayerView(view);
        } else {
            setPlayerView(prev => (prev === 'mini' ? 'full' : 'mini'));
        }
    };
    const playRandom = useCallback(() => {
        if (songsData.length <= 1) return;
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * songsData.length);
        } while (track && songsData[randomIndex]._id === track._id);

        setTrack(songsData[randomIndex]);
        setPlayStatus(true);
    }, [songsData, track]);

    const toggleLyricsVisibility = () => setIsLyricsVisible(prev => !prev);

    const toggleShuffle = () => {
        setIsShuffled(prev => !prev);
        // toast.info(`Shuffle ${!isShuffled ? 'ON' : 'OFF'}`);
    };
    const toggleLoop = () => {
        let newMode;
        if (loopMode === 'none') {
            newMode = 'track'; // Lặp lại 1 bài
            audioRef.current.loop = true;
        } else if (loopMode === 'track') {
            newMode = 'context'; // Lặp lại playlist/Context
            audioRef.current.loop = false;
        } else {
            newMode = 'none'; // Tắt lặp lại
            audioRef.current.loop = false;
        }
        setLoopMode(newMode);
        // toast.info(`Loop mode: ${newMode}`);
    };
    const setVolume = (newVolume) => {
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
            setVolumeState(newVolume);
            setIsMuted(newVolume === 0);
        }
    };
    const toggleMute = () => {
        if (audioRef.current) {
            if (isMuted) {
                const unmuteVolume = volume > 0.01 ? volume : 0.5;
                audioRef.current.volume = unmuteVolume;
                setVolumeState(unmuteVolume);
                setIsMuted(false);
            } else {
                audioRef.current.volume = 0;
                setIsMuted(true);
            }
        }
    };
    const toggleQueue = () => {
        setIsQueueOpen(prev => !prev);
        // toast.info(`Queue panel ${!isQueueOpen ? 'opened' : 'closed'}`);
    };

    // 1. Hàm Play/Pause
    const play = () => {
        audioRef.current.play();
        setPlayStatus(true);
    }
    const pause = () => {
        audioRef.current.pause();
        setPlayStatus(false);
    }

    // 2. Chuyển bài theo ID
    const playWithId = (id) => {
        const selectedTrack = songsData.find(item => item._id === id);
        if (selectedTrack) {
            setTrack(selectedTrack);
            setPlayStatus(true);
        }
    }

    // 4. Chuyển bài kế tiếp (Sử dụng useCallback để hàm ổn định trong useEffect)
    const next = useCallback(() => {
        if (!track || songsData.length === 0) return;

        // Logic Shuffle
        if (isShuffled) {
            playRandom();
            return;
        }

        const currentIndex = songsData.findIndex(item => item._id === track._id);

        if (currentIndex !== -1 && currentIndex < songsData.length - 1) {
            // Chuyển bài bình thường
            setTrack(songsData[currentIndex + 1]);
            setPlayStatus(true);
        } else if (currentIndex === songsData.length - 1) {
            if (loopMode === 'context') {
                // Lặp lại Context: Quay lại bài đầu tiên
                setTrack(songsData[0]);
                setPlayStatus(true);
            } else {
                // Dừng lại khi hết playlist (none mode)
                setTrack(songsData[0]);
                setPlayStatus(false);
            }
        }
    }, [songsData, track, isShuffled, loopMode, playRandom]);

    // 3. Chuyển bài trước
    const previous = () => {
        if (!track) return;
        const currentIndex = songsData.findIndex(item => item._id === track._id);
        if (currentIndex > 0) {
            setTrack(songsData[currentIndex - 1]);
            setPlayStatus(true);
        } else if (currentIndex === 0) {
            // Quay lại bài cuối cùng nếu đang ở bài đầu
            setTrack(songsData[songsData.length - 1]);
            setPlayStatus(true);
        }
    }

    const seekSong = (e) => {
        if (audioRef.current && seekBg.current) {
            audioRef.current.currentTime = ((e.nativeEvent.offsetX / seekBg.current.offsetWidth) * audioRef.current.duration);
        }
    }

    // 5. Fetch Data
    const getSongsData = async () => {
        try {
            const response = await axios.get(`${url}/api/song/list`);
            setSongsData(response.data.songs);
            if (response.data.songs.length > 0) {
                setTrack(response.data.songs[0]);
            }
        } catch (error) {
            console.error("Error fetching songs:", error);
        }
    }
    const getAlbumsData = async () => {
        try {
            const response = await axios.get(`${url}/api/album/list`);
            setAlbumsData(response.data.albums);
        } catch (error) {
            console.error("Error fetching albums:", error);
        }
    }

    // 6. useEffect để xử lý phát nhạc khi track thay đổi
    useEffect(() => {
        if (track) {
            audioRef.current.src = track.file;

            if (playStatus) {
                audioRef.current.play().catch(e => console.error("Auto-play failed:", e));
            }

            if (seekBar.current) {
                seekBar.current.style.width = "0%";
            }
        }
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume; // Đảm bảo âm lượng đúng
        }
    }, [track, playStatus, volume, isMuted]);

    // 7. useEffect để xử lý Time/Seekbar/Chuyển bài khi kết thúc
    useEffect(() => {
        const audio = audioRef.current;

        const updateTime = () => {
            if (audio.readyState >= 1) {
                const current = audio.currentTime;
                const total = audio.duration;

                // Cập nhật Seekbar
                if (seekBar.current && total > 0) {
                    seekBar.current.style.width = (Math.floor(current / total * 100)) + "%";
                }

                // Cập nhật Time
                setTime({
                    currentTime: {
                        second: Math.floor(current % 60),
                        minute: Math.floor(current / 60)
                    },
                    totalTime: {
                        second: Math.floor(total % 60),
                        minute: Math.floor(total / 60)
                    }
                });
            }
        };

        if (audio) {
            audio.ontimeupdate = updateTime;
            // Chỉ gán onended nếu không lặp lại 1 bài (loopMode !== 'track')
            if (loopMode !== 'track') {
                audio.onended = next;
            } else {
                audio.onended = null;
            }
        }

        // Lệnh dọn dẹp (Cleanup)
        return () => {
            if (audio) {
                audio.ontimeupdate = null;
                audio.onended = null;
            }
        };
        // Dùng next trong dependency array để đảm bảo closure của next luôn mới.
    }, [next, loopMode]);

    useEffect(() => {
        getSongsData();
        getAlbumsData();
    }, [])


    const contextValue = {
        audioRef, seekBar, seekBg,
        track, setTrack,
        playStatus, setPlayStatus,
        time, setTime,
        play, pause,
        playWithId, previous, next, seekSong,
        songsData, albumsData,
        volume, setVolume,
        isMuted, toggleMute,
        isShuffled, toggleShuffle,
        loopMode, toggleLoop,
        isQueueOpen, toggleQueue,
        playerView, setPlayerView, togglePlayerView,
        isLyricsVisible, toggleLyricsVisibility,
    }

    // 8. Thêm PlayerContext.Provider
    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
            {track && <audio ref={audioRef} src={track.file}></audio>}
        </PlayerContext.Provider>
    );
}

export default PlayerContextProvider;