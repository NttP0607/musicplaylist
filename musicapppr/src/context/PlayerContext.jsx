import React, { createContext, useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
// import toast from 'react-hot-toast'; // Giữ lại nếu bạn có thư viện toast

// Export Context
export const PlayerContext = createContext();

// Định nghĩa Component Provider
const PlayerContextProvider = (props) => {

    const audioRef = useRef();
    const seekBg = useRef();
    const seekBar = useRef();

    // Thay đổi URL nếu cần, dựa trên cấu hình backend thực tế của bạn
    const url = "http://localhost:4000";

    const [songsData, setSongsData] = useState([]); // Danh sách nhạc mặc định
    const [albumsData, setAlbumsData] = useState([]);

    // TRẠNG THÁI MỚI CHO QUEUE VÀ TRACK
    const [currentQueue, setCurrentQueue] = useState([]); // Danh sách phát hiện tại (có thể là songsData hoặc AI suggestions)
    const [queueTrackIndex, setQueueTrackIndex] = useState(-1); // Index của track trong currentQueue

    const [track, setTrack] = useState(null); // Track đang phát (lấy từ currentQueue[queueTrackIndex])
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
    });

    const togglePlayerView = (view = null) => {
        if (view) {
            setPlayerView(view);
        } else {
            setPlayerView(prev => (prev === 'mini' ? 'full' : 'mini'));
        }
    };

    const toggleLyricsVisibility = () => setIsLyricsVisible(prev => !prev);
    const toggleShuffle = () => { setIsShuffled(prev => !prev); /* toast.info(`Shuffle ${!isShuffled ? 'ON' : 'OFF'}`); */ };
    const toggleQueue = () => { setIsQueueOpen(prev => !prev); /* toast.info(`Queue panel ${!isQueueOpen ? 'opened' : 'closed'}`); */ };

    // Set Volume
    const setVolume = (newVolume) => {
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
            setVolumeState(newVolume);
            setIsMuted(newVolume === 0);
        }
    };

    // Toggle Mute
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

    // Toggle Loop Mode
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

    // Hàm Play/Pause
    const play = () => {
        if (!track) return;
        audioRef.current.play();
        setPlayStatus(true);
    }
    const pause = () => {
        audioRef.current.pause();
        setPlayStatus(false);
    }

    // Chuyển bài theo ID (Sử dụng songsData, cần cập nhật nếu muốn chuyển theo currentQueue)
    const playWithId = (id) => {
        const selectedTrack = songsData.find(item => item._id === id);
        if (selectedTrack) {
            // Khi playWithId, ta đang chơi trong context songsData
            const index = songsData.findIndex(item => item._id === id);
            setCurrentQueue(songsData);
            setQueueTrackIndex(index);
            setTrack(selectedTrack);
            setPlayStatus(true);
        }
    }

    // Xử lý logic chuyển bài ngẫu nhiên (chỉ trong currentQueue)
    const playRandom = useCallback(() => {
        if (currentQueue.length <= 1) return;
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * currentQueue.length);
        } while (track && currentQueue[randomIndex].file === track.file); // So sánh bằng file để đảm bảo duy nhất

        setQueueTrackIndex(randomIndex);
        setTrack(currentQueue[randomIndex]);
        setPlayStatus(true);
    }, [currentQueue, track]);

    // 3. Chuyển bài trước
    const previous = () => {
        if (!track || currentQueue.length === 0) return;

        let newIndex = queueTrackIndex - 1;

        if (newIndex < 0) {
            // Quay lại bài cuối cùng nếu đang ở bài đầu
            newIndex = currentQueue.length - 1;
        }

        setQueueTrackIndex(newIndex);
        setTrack(currentQueue[newIndex]);
        setPlayStatus(true);
    }

    // 4. Chuyển bài kế tiếp (Sử dụng useCallback để hàm ổn định trong useEffect)
    const next = useCallback(() => {
        if (!track || currentQueue.length === 0) return;

        // Logic Shuffle
        if (isShuffled) {
            playRandom();
            return;
        }

        let newIndex = queueTrackIndex + 1;

        if (newIndex >= currentQueue.length) {
            if (loopMode === 'context') {
                // Lặp lại Context: Quay lại bài đầu tiên
                newIndex = 0;
            } else {
                // Dừng lại khi hết playlist (none mode)
                setPlayStatus(false);
                setQueueTrackIndex(0);
                setTrack(currentQueue[0]); // Đặt lại bài đầu tiên nhưng dừng
                return;
            }
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

    // === HÀM TÍCH HỢP AI: PHÁT DANH SÁCH MỚI ===
    const playNewQueue = (newSongs, startIndex = 0) => {
        if (newSongs.length === 0) {
            // Tắt nhạc và xóa queue nếu danh sách rỗng
            setPlayStatus(false);
            setCurrentQueue([]);
            setTrack(null);
            setQueueTrackIndex(-1);
            return;
        }

        // 1. Đặt danh sách gợi ý AI làm Current Queue
        setCurrentQueue(newSongs);

        // 2. Cập nhật bài hát đang phát
        const songToPlay = newSongs[startIndex];
        setTrack(songToPlay);
        setQueueTrackIndex(startIndex);

        // 3. Bắt đầu phát (sẽ được xử lý bởi useEffect [track, playStatus])
        setPlayStatus(true);
        // toast.success(`Playing ${songToPlay.name}`); // Thông báo thành công
    };
    // ===========================================

    // 5. Fetch Data (Chỉ fetch songsData ban đầu)
    const getSongsData = async () => {
        try {
            const response = await axios.get(`${url}/api/song/list`);
            const fetchedSongs = response.data.songs;
            setSongsData(fetchedSongs);

            if (fetchedSongs.length > 0) {
                // Khởi tạo Current Queue là songsData mặc định
                setCurrentQueue(fetchedSongs);
                setQueueTrackIndex(0);
                setTrack(fetchedSongs[0]);
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
            } else {
                audioRef.current.pause();
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
        // Dữ liệu và hàm mới cho AI Integration
        currentQueue,
        queueTrackIndex,
        playNewQueue // <-- HÀM MỚI
    }

    // 8. Thêm PlayerContext.Provider
    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
            {/* Audio element chỉ render khi có track được chọn */}
            {track && <audio ref={audioRef} src={track.file}></audio>}
        </PlayerContext.Provider>
    );
}

export default PlayerContextProvider;