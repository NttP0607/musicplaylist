import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AddArtistModal = ({ onClose }) => {
    const [formData, setFormData] = useState({
        name: "",
        bio: "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error("Vui lòng nhập tên nghệ sĩ.");
            return;
        }

        setIsSubmitting(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (imageFile) data.append('image', imageFile);

        try {
            // Giả định API thêm nghệ sĩ là /api/artist/add
            const response = await axios.post('http://localhost:4000/api/artist/add', data);

            if (response.data.success) {
                toast.success(response.data.message);
                onClose(true); // Đóng modal và yêu cầu tải lại danh sách
            } else {
                toast.error(response.data.message || "Thêm nghệ sĩ thất bại.");
            }
        } catch (error) {
            console.error("Add artist error:", error);
            toast.error("Lỗi kết nối khi thêm nghệ sĩ.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md m-4">
                <h3 className="text-xl font-bold mb-4">Thêm Nghệ Sĩ Mới</h3>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div><label className="block text-sm font-medium">Tên Nghệ Sĩ *</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded" /></div>

                    <div><label className="block text-sm font-medium">Tiểu Sử (Bio)</label><textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" className="w-full p-2 border rounded" /></div>

                    <div>
                        <label className="block text-sm font-medium">Ảnh Đại Diện</label>
                        <input type="file" onChange={(e) => setImageFile(e.target.files[0])} accept="image/*" className="w-full text-sm mt-1" />
                    </div>

                    <div className="flex justify-end pt-2">
                        <button type="button" onClick={() => onClose(false)} className="mr-4 p-2 text-gray-600">Hủy</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400">
                            {isSubmitting ? 'Đang Thêm...' : 'Thêm Nghệ Sĩ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddArtistModal;