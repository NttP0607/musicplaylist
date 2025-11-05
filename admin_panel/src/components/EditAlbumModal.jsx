import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";

const EditAlbumModal = ({ album, onClose }) => {
    // Khởi tạo state form từ dữ liệu album hiện tại
    const [formData, setFormData] = useState({
        name: album.name || "",
        desc: album.desc || "",
        artistName: album.artistName || "",
        bgColor: album.bgColor || "#000000",
    });
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();

        // Thêm các trường text đã chỉnh sửa
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        // Thêm file mới nếu có
        if (imageFile) data.append('image', imageFile);

        try {
            // Sử dụng endpoint update với ID (đã cấu hình trong albumRoute)
            const response = await axios.post(`http://localhost:4000/api/album/update/${album._id}`, data);

            if (response.data.success) {
                toast.success(response.data.message);
                onClose(true); // Đóng modal và yêu cầu tải lại danh sách
            } else {
                toast.error(response.data.message || "Cập nhật thất bại.");
            }
        } catch (error) {
            console.error("Update album error:", error);
            toast.error("Lỗi kết nối hoặc server khi cập nhật.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg m-4">
                <h3 className="text-xl font-bold mb-4">Sửa Album: {album.name}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ... (Form fields) ... */}
                    <div><label>Tên Album*</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded" /></div>
                    <div><label>Nghệ Sĩ*</label><input type="text" name="artistName" value={formData.artistName} onChange={handleChange} required className="w-full p-2 border rounded" /></div>
                    <div><label>Mô Tả</label><input type="text" name="desc" value={formData.desc} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                    <div className="flex items-center gap-4">
                        <label>Màu Nền:</label>
                        <input type="color" name="bgColor" value={formData.bgColor} onChange={handleChange} className="w-16 h-8" />
                        <p className="text-xs">Ảnh bìa hiện tại:</p>
                        <img src={album.image} alt="Current Album" className="w-10 h-10 object-cover rounded-sm" />
                    </div>
                    <div>
                        <label>Thay đổi Ảnh Bìa</label>
                        <input type="file" onChange={(e) => setImageFile(e.target.files[0])} accept="image/*" className="w-full text-sm mt-1" />
                        {imageFile && <p className="text-green-600 text-xs">Ảnh mới đã chọn.</p>}
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="button" onClick={() => onClose(false)} className="mr-4 p-2 text-gray-600">Hủy</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400">
                            {isSubmitting ? 'Đang Cập Nhật...' : 'Lưu Thay Đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAlbumModal;