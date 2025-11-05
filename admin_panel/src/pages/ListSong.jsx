import axios from "axios";
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import EditSongModal from "../components/EditSongModal";
import DetailSongModal from "../components/DetailSongModal"; // 🆕 Component mới cho xem chi tiết
import AddSongModal from "../components/AddSongModal"; // 🆕 Component mới cho thêm bài hát

const ListSong = () => {
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // States cho các Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // 🆕 State cho modal thêm bài hát

    const [currentSong, setCurrentSong] = useState(null);

    // Hàm chuyển đổi thời lượng từ giây sang định dạng MM:SS
    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');
        return `${formattedMinutes}:${formattedSeconds}`;
    };

    // Hàm chung để gọi API lấy danh sách/tìm kiếm bài hát
    const fetchSongs = useCallback(async () => {
        setIsLoading(true);
        try {
            const endpoint = searchQuery.trim()
                ? `http://localhost:4000/api/song/search?query=${searchQuery.trim()}`
                : `http://localhost:4000/api/song/list`;

            const response = await axios.get(endpoint);

            if (response.data.success) {
                const songs = response.data.songs || response.data.matchedSongs;
                setData(songs || []);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error("Fetch songs error:", error);
            toast.error("Lỗi khi tải dữ liệu bài hát.");
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery]);

    // Xử lý xóa bài hát
    const removeSong = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài hát này không?")) {
            return;
        }

        try {
            const response = await axios.post(`http://localhost:4000/api/song/remove`, { id });

            if (response.data.success) {
                toast.success(response.data.message);
                await fetchSongs(); // Tải lại danh sách
            } else {
                toast.error(response.data.message || "Xóa bài hát thất bại.");
            }
        } catch (error) {
            console.error("Remove song error:", error);
            toast.error("Lỗi kết nối khi xóa bài hát.");
        }
    };

    // --- LOGIC MỞ/ĐÓNG MODAL ---

    // Mở modal thêm bài hát
    const openAddModal = () => setIsAddModalOpen(true);

    // Mở modal chỉnh sửa
    const openEditModal = (song) => {
        const songToEdit = {
            ...song,
            artistName: song.artist?.name || '',
            albumName: song.album?.name || 'none'
        };
        setCurrentSong(songToEdit);
        setIsEditModalOpen(true);
    };

    // Mở modal xem chi tiết
    const openDetailModal = (song) => {
        setCurrentSong(song);
        setIsDetailModalOpen(true);
    };

    // Hàm đóng tất cả modal và tải lại danh sách nếu cần
    const closeModal = (shouldRefetch = false) => {
        setIsEditModalOpen(false);
        setIsDetailModalOpen(false);
        setIsAddModalOpen(false);
        setCurrentSong(null);
        if (shouldRefetch) {
            fetchSongs();
        }
    };

    // Tải danh sách ban đầu và mỗi khi chuỗi tìm kiếm thay đổi (debounce)
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchSongs();
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery, fetchSongs]);

    return (
        <div className="p-4 md:p-6 bg-white min-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Danh Sách Bài Hát</h2>
                <button
                    onClick={openAddModal}
                    className="px-4 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition duration-150"
                >
                    + Thêm Bài Hát Mới
                </button>
            </div>

            {/* Thanh tìm kiếm */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-1/3 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Header của bảng */}
            <div className="sm:grid hidden grid-cols-[0.5fr_1.5fr_1.5fr_1fr_0.8fr_0.8fr_0.8fr] items-center gap-2.5 p-3 border border-gray-300 text-sm mr-5 bg-gray-100 font-semibold text-gray-700">
                <b>Ảnh</b>
                <b>Tên Bài Hát</b>
                <b>Nghệ Sĩ</b>
                <b>Album</b>
                <b>Thời Lượng</b>
                <b>Sửa</b>
                <b>Xóa</b>
            </div>

            {/* Hiển thị Loading/Rỗng */}
            {isLoading && <p className="text-center p-4">Đang tải dữ liệu...</p>}

            {!isLoading && data.length === 0 && (
                <p className="text-center p-4 text-gray-500">Không tìm thấy bài hát nào.</p>
            )}

            {/* Dữ liệu bài hát */}
            {!isLoading && data.map((item) => (
                <div
                    key={item._id}
                    className="grid grid-cols-[1fr_1fr_1fr] sm:grid-cols-[0.5fr_1.5fr_1.5fr_1fr_0.8fr_0.8fr_0.8fr] items-center gap-2.5 p-3 border-b border-gray-200 text-sm mr-5 hover:bg-gray-100 transition duration-150 cursor-pointer"
                    onClick={() => openDetailModal(item)} // 🆕 Mở modal chi tiết khi click vào hàng
                >
                    <img className="w-10 h-10 object-cover rounded-md" src={item.image || ''} alt={item.name} />
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-gray-600">{item.artist?.name || 'N/A'}</p>
                    <p className="text-gray-600">{item.album?.name || 'Độc lập'}</p>
                    <p className="text-gray-600">{formatDuration(item.duration || 0)}</p>

                    {/* Hành Động Sửa */}
                    {/* Dùng event.stopPropagation() để ngăn việc click vào nút Sửa kích hoạt sự kiện click của hàng (mở Detail Modal) */}
                    <p
                        className="text-blue-500 hover:text-blue-700 font-medium"
                        onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
                    >
                        Sửa
                    </p>

                    {/* Hành Động Xóa */}
                    <p
                        className="text-red-500 hover:text-red-700 font-medium"
                        onClick={(e) => { e.stopPropagation(); removeSong(item._id); }}
                    >
                        Xóa
                    </p>
                </div>
            ))}

            {/* Modal chỉnh sửa */}
            {isEditModalOpen && currentSong && (
                <EditSongModal
                    song={currentSong}
                    onClose={closeModal} // Đóng modal và có thể tải lại danh sách
                />
            )}

            {/* Modal Xem Chi Tiết */}
            {isDetailModalOpen && currentSong && (
                <DetailSongModal
                    song={currentSong}
                    onClose={closeModal}
                    formatDuration={formatDuration}
                />
            )}

            {/* Modal Thêm Bài Hát (Giả định) */}
            {isAddModalOpen && (
                <AddSongModal
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

export default ListSong;