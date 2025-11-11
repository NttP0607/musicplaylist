import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AddPlaylistModal = ({ onClose, currentUserId }) => {
    const [name, setName] = useState("");
    const [isPublic, setIsPublic] = useState(true); // Mặc định Public cho Admin
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Tên playlist không được để trống.");
            return;
        }
        setIsSubmitting(true);

        try {
            const response = await axios.post('http://localhost:4000/api/playlist/add', {
                name: name.trim(),
                isPublic,
                // Note: user ID sẽ được tự động lấy từ req.user trong controller
            });

            if (response.data.success) {
                toast.success(response.data.message);
                onClose(true);
            } else {
                toast.error(response.data.message || "Thêm playlist thất bại.");
            }
        } catch (error) {
            toast.error("Lỗi kết nối khi thêm playlist.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm m-4">
                <h3 className="text-xl font-bold mb-4">Thêm Playlist Mới</h3>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium">Tên Playlist</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 border rounded" />
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="isPublic" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="h-4 w-4" />
                        <label htmlFor="isPublic" className="text-sm">Công Khai (Hiển thị cho mọi người)</label>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button type="button" onClick={() => onClose(false)} className="mr-4 p-2 text-gray-600">Hủy</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400">
                            {isSubmitting ? 'Đang Tạo...' : 'Tạo Playlist'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPlaylistModal;