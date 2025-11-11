import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// ✅ NHẬN PROP currentSongsInPlaylist
export const AddSongToPlaylistModal = ({ playlistId, playlistName, onClose, onSongsAdded, currentSongsInPlaylist = [] }) => {
    const [availableSongs, setAvailableSongs] = useState([]);
    const [selectedSongs, setSelectedSongs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Sử dụng useMemo để tạo Set ID bài hát hiện tại, tối ưu hóa quá trình lọc
    const existingSongIds = useMemo(() =>
        new Set(currentSongsInPlaylist.map(song => song._id))
        , [currentSongsInPlaylist]);

    // 1. Lấy danh sách TẤT CẢ bài hát có sẵn
    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/song/list`);

                if (response.data.success) {
                    // Lưu tất cả bài hát, việc lọc loại trừ sẽ diễn ra ở bước 4
                    setAvailableSongs(response.data.songs);
                }
            } catch (error) {
                toast.error("Lỗi tải danh sách bài hát.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSongs();
    }, [playlistId]); // Chỉ fetch lại khi playlistId thay đổi

    // 2. Xử lý chọn/bỏ chọn bài hát
    const handleSelectSong = (songId) => {
        setSelectedSongs(prev =>
            prev.includes(songId)
                ? prev.filter(id => id !== songId)
                : [...prev, songId]
        );
    };

    // 3. Xử lý Thêm Bài Hát
    const handleAddSongs = async () => {
        if (selectedSongs.length === 0) {
            toast.warn("Vui lòng chọn ít nhất một bài hát.");
            return;
        }

        try {
            let updatedPlaylistData = null;

            // Gửi từng request thêm bài hát một (dựa trên giả định Controller chỉ nhận 1 songId)
            for (const songId of selectedSongs) {
                const response = await axios.post(`http://localhost:4000/api/playlist/song/add`, {
                    playlistId: playlistId,
                    songId: songId
                });
                updatedPlaylistData = response.data.playlist;
            }

            toast.success(`Đã thêm ${selectedSongs.length} bài hát vào playlist.`);
            onSongsAdded(updatedPlaylistData); // Cập nhật chi tiết playlist cha
            // onClose được gọi trong handleSongsAdded của component cha
        } catch (error) {
            const msg = error.response?.data?.message || "Lỗi kết nối khi thêm bài hát.";
            toast.error(msg);
        }
    };

    // 4. Lọc bài hát hiển thị
    const filteredSongs = availableSongs.filter(song => {
        const matchesSearch =
            song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.artist?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        // ✅ Lọc loại trừ: Bài hát không được có trong playlist hiện tại
        const isNotExisting = !existingSongIds.has(song._id);

        return matchesSearch && isNotExisting;
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-xl m-4 h-[80vh] flex flex-col">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Thêm Bài Hát vào Playlist: {playlistName}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-600 text-3xl">&times;</button>
                </div>

                <input
                    type="text"
                    placeholder="Tìm kiếm bài hát..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="p-2 border border-gray-300 rounded mb-4"
                />

                <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {isLoading ? (
                        <p className="text-center py-4">Đang tải danh sách bài hát...</p>
                    ) : (
                        <div className="space-y-2">
                            {filteredSongs.length > 0 ? filteredSongs.map(song => (
                                <div
                                    key={song._id}
                                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition ${selectedSongs.includes(song._id) ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50 border border-gray-100'
                                        }`}
                                    onClick={() => handleSelectSong(song._id)}
                                >
                                    <span className="font-medium">{song.name}</span>
                                    <span className="text-gray-500 text-sm">{song.artist?.name || 'Unknown Artist'}</span>
                                    {selectedSongs.includes(song._id) ? (
                                        <span className="text-blue-600 font-bold">✓ Đã chọn</span>
                                    ) : (
                                        <span className="text-gray-500 text-sm">Chọn</span>
                                    )}
                                </div>
                            )) : (
                                <p className="text-center text-gray-500 py-4">
                                    {availableSongs.length > 0 ? "Không tìm thấy bài hát phù hợp với từ khóa." : "Không có bài hát nào trong hệ thống để thêm."}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4 gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
                        Hủy
                    </button>
                    <button
                        onClick={handleAddSongs}
                        disabled={selectedSongs.length === 0}
                        className={`px-4 py-2 rounded-md font-semibold transition ${selectedSongs.length > 0 ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        Thêm ({selectedSongs.length}) Bài Hát
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddSongToPlaylistModal;