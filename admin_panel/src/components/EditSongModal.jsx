import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";

const EditSongModal = ({ song, onClose }) => {
    // Khởi tạo state form từ dữ liệu bài hát hiện tại
    const [formData, setFormData] = useState({
        name: song.name,
        desc: song.desc || "",
        artistName: song.artistName, // Tên nghệ sĩ (đã được lấy từ ListSong)
        albumName: song.albumName,   // Tên album (đã được lấy từ ListSong)
        genre: song.genre || "",
        mood: song.mood || "",
        lyrics: song.lyrics || "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [audioFile, setAudioFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e, type) => {
        if (type === 'image') {
            setImageFile(e.target.files[0]);
        } else {
            setAudioFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append('id', song._id);

        // Thêm các trường text đã chỉnh sửa
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        // Thêm file mới nếu có
        if (imageFile) data.append('image', imageFile);
        if (audioFile) data.append('audio', audioFile);

        try {
            const response = await axios.post('http://localhost:4000/api/song/update', data);

            if (response.data.success) {
                toast.success(response.data.message);
                onClose(true); // Đóng modal và yêu cầu tải lại danh sách (true)
            } else {
                toast.error(response.data.message || "Cập nhật thất bại.");
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Lỗi kết nối hoặc server khi cập nhật.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-2xl w-full max-w-2xl m-4">
                <div className="flex justify-between items-center mb-6 border-b pb-2">
                    <h3 className="text-2xl font-bold text-gray-800">Chỉnh Sửa Bài Hát: {song.name}</h3>
                    <button onClick={() => onClose(false)} className="text-gray-500 hover:text-red-600 text-3xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Tên Bài Hát */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tên Bài Hát</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>

                    {/* Nghệ Sĩ & Album */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tên Nghệ Sĩ</label>
                            <input
                                type="text"
                                name="artistName"
                                value={formData.artistName}
                                onChange={handleChange}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tên Album (Ghi 'none' nếu không có)</label>
                            <input
                                type="text"
                                name="albumName"
                                value={formData.albumName}
                                onChange={handleChange}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

                    {/* Thể Loại & Tâm Trạng */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Thể Loại (Genre)</label>
                            <input
                                type="text"
                                name="genre"
                                value={formData.genre}
                                onChange={handleChange}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tâm Trạng (Mood)</label>
                            <input
                                type="text"
                                name="mood"
                                value={formData.mood}
                                onChange={handleChange}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

                    {/* Mô Tả */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mô Tả</label>
                        <textarea
                            name="desc"
                            value={formData.desc}
                            onChange={handleChange}
                            rows="2"
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                        ></textarea>
                    </div>

                    {/* Lyrics */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Lời Bài Hát (Lyrics)</label>
                        <textarea
                            name="lyrics"
                            value={formData.lyrics}
                            onChange={handleChange}
                            rows="4"
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                        ></textarea>
                    </div>

                    {/* File Uploads (Chỉ upload khi cần thay đổi) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Thay đổi Ảnh Bìa</label>
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'image')}
                                className="mt-1 w-full text-sm text-gray-500"
                            />
                            {imageFile ? <p className="text-green-600 text-xs">Đã chọn file ảnh mới.</p> : <p className="text-gray-500 text-xs">Giữ nguyên ảnh cũ nếu không chọn.</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Thay đổi File Nhạc</label>
                            <input
                                type="file"
                                name="audio"
                                accept="audio/*"
                                onChange={(e) => handleFileChange(e, 'audio')}
                                className="mt-1 w-full text-sm text-gray-500"
                            />
                            {audioFile ? <p className="text-green-600 text-xs">Đã chọn file nhạc mới.</p> : <p className="text-gray-500 text-xs">Giữ nguyên nhạc cũ nếu không chọn.</p>}
                        </div>
                    </div>

                    {/* Nút Submit */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-150 disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'Đang Cập Nhật...' : 'Lưu Thay Đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditSongModal;