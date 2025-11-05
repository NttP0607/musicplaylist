import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AddArtistModal from "../components/AddArtistModal";
import EditArtistModal from "../components/EditArtistModal";
import defaultArtistImage from '../assets/default_artist_img.png';

const ListArtist = () => {
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // States quản lý Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currentArtist, setCurrentArtist] = useState(null);

    // Hàm fetch dữ liệu/tìm kiếm
    const fetchArtists = useCallback(async () => {
        setIsLoading(true);
        try {
            const endpoint = searchQuery.trim()
                ? `http://localhost:4000/api/artist/search?keyword=${searchQuery.trim()}`
                : `http://localhost:4000/api/artist/list`;

            const response = await axios.get(endpoint);

            if (response.data.success) {
                setData(response.data.artists || []);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error("Fetch artists error:", error);
            toast.error("Lỗi khi tải dữ liệu nghệ sĩ.");
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery]);

    // Xử lý xóa nghệ sĩ
    const removeArtist = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa nghệ sĩ này? Hành động này không thể hoàn tác.")) {
            return;
        }

        try {
            // Giả định API xóa dùng POST với body { id }
            const response = await axios.post(`http://localhost:4000/api/artist/remove`, { id });

            if (response.data.success) {
                toast.success(response.data.message);
                await fetchArtists();
            } else {
                toast.error(response.data.message || "Xóa nghệ sĩ thất bại.");
            }
        } catch (error) {
            console.error("Remove artist error:", error);
            toast.error("Lỗi kết nối khi xóa nghệ sĩ.");
        }
    };

    // Hàm mở modal chỉnh sửa
    const openEditModal = (artist) => {
        setCurrentArtist(artist);
        setIsEditModalOpen(true);
    };

    // Hàm đóng modal và tải lại danh sách
    const closeModal = (shouldRefetch = false) => {
        setIsEditModalOpen(false);
        setIsAddModalOpen(false);
        setCurrentArtist(null);
        if (shouldRefetch) {
            fetchArtists();
        }
    };

    // Tải danh sách nghệ sĩ (debounce)
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchArtists();
        }, 300);

        return () => clearTimeout(handler);
    }, [searchQuery, fetchArtists]);

    return (
        <div className="p-4 md:p-6 bg-gray-100 min-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Danh Sách Nghệ Sĩ</h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition"
                >
                    + Thêm Nghệ Sĩ
                </button>
            </div>

            {/* Thanh tìm kiếm */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Tìm kiếm nghệ sĩ theo tên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-1/3 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Header của bảng */}
            <div className="sm:grid hidden grid-cols-[0.5fr_1.5fr_2fr_1fr_0.5fr] items-center gap-2.5 p-3 border border-gray-300 text-sm mr-5 bg-gray-200 font-semibold text-gray-700">
                <b>Ảnh</b>
                <b>Tên Nghệ Sĩ</b>
                <b>Tiểu sử (Bio)</b>
                <b>Ngày tạo</b>
                <b>Hành Động</b>
            </div>

            {/* Loading và Dữ liệu */}
            {isLoading && <p className="text-center p-4">Đang tải dữ liệu...</p>}

            {!isLoading && data.length === 0 && (
                <p className="text-center p-4 text-gray-500">Không tìm thấy nghệ sĩ nào.</p>
            )}

            {!isLoading && data.map((item, index) => (
                <div key={index} className="grid sm:grid-cols-[0.5fr_1.5fr_2fr_1fr_0.5fr] items-center gap-2.5 p-3 border-b border-gray-200 text-sm mr-5 hover:bg-gray-50">
                    <img className="w-10 h-10 object-cover rounded-full"
                        src={item.image || defaultArtistImage}
                        alt={item.name}
                    />
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-gray-600 truncate">{item.bio || 'Chưa có tiểu sử'}</p>
                    <p className="text-gray-500">
                        {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : 'N/A'}
                    </p>
                    <div className="flex gap-2">
                        <button onClick={() => openEditModal(item)} className="text-blue-600 hover:underline">Sửa</button>
                        <button onClick={() => removeArtist(item._id)} className="text-red-600 hover:underline">Xóa</button>
                    </div>
                </div>
            ))}

            {/* Modals */}
            {isAddModalOpen && <AddArtistModal onClose={closeModal} />}
            {isEditModalOpen && currentArtist && <EditArtistModal artist={currentArtist} onClose={closeModal} />}
        </div>
    );
};

export default ListArtist;