import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import EditAlbumModal from "../components/EditAlbumModal";
import AddAlbumModal from "../components/AddAlbumModal";
import DetailAlbumModal from "../components/DetailAlbumModal";

const ListAlbum = () => {
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // States quản lý Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [currentAlbum, setCurrentAlbum] = useState(null);

    const fetchAlbums = useCallback(async () => {
        setIsLoading(true);
        try {
            const endpoint = searchQuery.trim()
                ? `http://localhost:4000/api/album/search?keyword=${searchQuery.trim()}`
                : `http://localhost:4000/api/album/list`;
            const response = await axios.get(endpoint);
            if (response.data.success) {
                setData(response.data.albums || []);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error("Fetch albums error:", error);
            toast.error("Lỗi khi tải dữ liệu album.");
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery]);

    const removeAlbum = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa album này?")) return;
        try {
            const response = await axios.post(`http://localhost:4000/api/album/remove`, { id });
            if (response.data.success) {
                toast.success(response.data.message);
                await fetchAlbums();
            } else {
                toast.error(response.data.message || "Xóa album thất bại.");
            }
        } catch (error) {
            toast.error("Lỗi kết nối khi xóa album.");
        }
    };

    const prepareAlbumData = (album) => ({
        ...album,
        artistName: album.artist?.name || ''
    });

    const openEditModal = (album) => {
        setCurrentAlbum(prepareAlbumData(album));
        setIsEditModalOpen(true);
    };

    const openDetailModal = (album) => {
        setCurrentAlbum(prepareAlbumData(album));
        setIsDetailModalOpen(true);
    };

    const closeModal = (shouldRefetch = false) => {
        setIsEditModalOpen(false);
        setIsAddModalOpen(false);
        setIsDetailModalOpen(false);
        setCurrentAlbum(null);
        if (shouldRefetch) {
            fetchAlbums();
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchAlbums();
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery, fetchAlbums]);

    return (
        <div className="p-4 md:p-6 bg-gray-100 min-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Danh Sách Album</h2>
                <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition">
                    + Thêm Album Mới
                </button>
            </div>

            {/* Thanh tìm kiếm */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Tìm kiếm album theo tên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-1/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Header của bảng */}
            <div className="sm:grid hidden grid-cols-[0.5fr_1.5fr_1.5fr_1fr_1fr_0.5fr] items-center gap-2.5 p-3 border border-gray-300 text-sm mr-5 bg-gray-200 font-semibold text-gray-700">
                <b>Ảnh</b>
                <b>Tên Album</b>
                <b>Nghệ Sĩ</b>
                <b>Mô Tả</b>
                <b>Màu nền</b>
                <b>Hành Động</b>
            </div>

            {/* Loading và Empty State */}
            {isLoading && <p className="text-center p-4">Đang tải dữ liệu...</p>}
            {!isLoading && data.length === 0 && (<p className="text-center p-4 text-gray-500">Không tìm thấy album nào.</p>)}

            {/* Dữ liệu Album */}
            {!isLoading && data.map((item, index) => (
                <div key={index} style={{ backgroundColor: item.bgColor ? item.bgColor + '30' : '#ffffff' }} className="grid sm:grid-cols-[0.5fr_1.5fr_1.5fr_1fr_1fr_0.5fr] items-center gap-2.5 p-3 border-b border-gray-200 text-sm mr-5 hover:bg-gray-200/50 transition duration-150">
                    <img className="w-10 h-10 object-cover" src={item.image} alt={item.name} />
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-gray-700">{item.artist?.name || 'N/A'}</p>
                    <p className="text-gray-700 truncate">{item.desc}</p>
                    <div className="flex items-center gap-2">
                        <div style={{ backgroundColor: item.bgColor }} className="w-8 h-4 rounded-sm border border-gray-300" title={item.bgColor}></div>
                        <p className="text-xs text-gray-700">{item.bgColor}</p>
                    </div>

                    <div className="flex flex-col gap-1 text-sm">
                        <button onClick={() => openDetailModal(item)} className="text-gray-700 hover:text-green-600 hover:underline text-left">Chi tiết & QL Bài hát</button>
                        <button onClick={() => openEditModal(item)} className="text-blue-600 hover:underline text-left">Sửa</button>
                        <button onClick={() => removeAlbum(item._id)} className="text-red-600 hover:underline text-left">Xóa</button>
                    </div>
                </div>
            ))}

            {/* Modals */}
            {isAddModalOpen && <AddAlbumModal onClose={closeModal} />}
            {isEditModalOpen && currentAlbum && <EditAlbumModal album={currentAlbum} onClose={closeModal} />}
            {isDetailModalOpen && currentAlbum && (
                <DetailAlbumModal
                    albumId={currentAlbum._id}
                    onClose={closeModal}
                    refreshList={() => closeModal(true)}
                />
            )}
        </div>
    );
};

export default ListAlbum;