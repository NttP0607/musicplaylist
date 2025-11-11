import React, { useState, useEffect, useCallback, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AddPlaylistModal from "../components/AddPlaylistModal";
import ManagePlaylistModal from "../components/ManagePlaylistModal";
// Import AuthContext từ đường dẫn đã sửa lỗi
import { AuthContext } from "D:/PBL6/musicapppr_full/musicapppr/src/context/AuthContext.jsx";

const ListPlaylist = () => {
    // ✅ Lấy cả user và trạng thái loading từ AuthContext
    const { user, loading } = useContext(AuthContext);

    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // States quản lý Modal
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currentPlaylist, setCurrentPlaylist] = useState(null);

    // Hàm fetch dữ liệu/tìm kiếm (Chỉ lấy Public)
    const fetchPlaylists = useCallback(async () => {
        setIsLoading(true);
        try {
            const endpoint = searchQuery.trim()
                ? `http://localhost:4000/api/playlist/search?keyword=${searchQuery.trim()}`
                : `http://localhost:4000/api/playlist/list`;

            // Yêu cầu này sẽ tự động đính kèm token nếu đã được thiết lập trong AuthContext
            const response = await axios.get(endpoint);

            if (response.data.success) {
                setData(response.data.playlists || []);
            }
        } catch (error) {
            console.error("Fetch playlists error:", error);
            // Lỗi 401 sẽ bị bắt ở đây
            toast.error("Lỗi khi tải dữ liệu playlist (Kiểm tra đăng nhập).");
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery]);

    // Xử lý xóa playlist
    const removePlaylist = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa playlist này?")) return;

        try {
            const response = await axios.post(`http://localhost:4000/api/playlist/remove`, { id });

            if (response.data.success) {
                toast.success(response.data.message);
                await fetchPlaylists();
            } else {
                toast.error(response.data.message || "Xóa playlist thất bại.");
            }
        } catch (error) {
            toast.error("Lỗi kết nối khi xóa playlist.");
        }
    };

    const openManageModal = (playlist) => {
        setCurrentPlaylist(playlist);
        setIsManageModalOpen(true);
    };

    const closeModal = (shouldRefetch = false) => {
        setIsManageModalOpen(false);
        setIsAddModalOpen(false);
        setCurrentPlaylist(null);
        if (shouldRefetch) {
            fetchPlaylists();
        }
    };

    // 🎯 FIX: Chỉ gọi fetchPlaylists khi Context HOÀN TẤT tải token/user (loading = false)
    useEffect(() => {
        if (!loading) {
            const handler = setTimeout(() => {
                fetchPlaylists();
            }, 300);

            return () => clearTimeout(handler);
        }
    }, [searchQuery, fetchPlaylists, loading]); // Thêm loading vào dependency

    // ⚠️ Xử lý trường hợp đang tải Context/Auth
    if (loading) {
        return <div className="p-4 text-center text-gray-700">Đang kiểm tra phiên đăng nhập...</div>;
    }

    return (
        <div className="p-4 md:p-6 bg-gray-100 min-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Quản Lý Playlists</h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition"
                >
                    + Thêm Playlist
                </button>
            </div>

            {/* Thanh tìm kiếm */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Tìm kiếm playlist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-1/3 p-2 border border-gray-300 rounded"
                />
            </div>

            {/* Bảng danh sách */}
            <div className="sm:grid hidden grid-cols-[1.5fr_1fr_1fr_1fr_0.5fr] items-center gap-2.5 p-3 border border-gray-300 text-sm mr-5 bg-gray-200 font-semibold text-gray-700">
                <b>Tên Playlist</b>
                <b>Chủ Sở Hữu</b>
                <b>Bài Hát</b>
                <b>Trạng thái</b>
                <b>Hành Động</b>
            </div>

            {/* Dữ liệu */}
            {isLoading && <p className="text-center p-4">Đang tải dữ liệu...</p>}

            {!isLoading && data.length === 0 && (
                <p className="text-center p-4 text-gray-500">Không tìm thấy playlist nào.</p>
            )}

            {!isLoading && data.map((item, index) => (
                <div key={index} className="grid sm:grid-cols-[1.5fr_1fr_1fr_1fr_0.5fr] items-center gap-2.5 p-3 border-b border-gray-200 text-sm mr-5 hover:bg-gray-50">
                    <p className="font-medium">{item.name}</p>
                    <p>{item.user?.username || 'N/A'}</p>
                    <p>{item.songs?.length || 0}</p>
                    <p className={item.isPublic ? 'text-green-600' : 'text-red-600'}>
                        {item.isPublic ? 'Công Khai' : 'Riêng Tư'}
                    </p>
                    <div className="flex gap-2">
                        <button onClick={() => openManageModal(item)} className="text-blue-600 hover:underline">QLý Bài hát</button>
                        <button onClick={() => removePlaylist(item._id)} className="text-red-600 hover:underline">Xóa</button>
                    </div>
                </div>
            ))}

            {/* Modals */}
            {isAddModalOpen && <AddPlaylistModal onClose={closeModal} currentUserId={user?._id} />}
            {isManageModalOpen && currentPlaylist && <ManagePlaylistModal playlist={currentPlaylist} onClose={closeModal} />}
        </div>
    );
};

export default ListPlaylist;