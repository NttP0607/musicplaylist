import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const EditSongModal = ({ song, onClose }) => {
    // States để lưu danh sách thể loại và tâm trạng
    const [genres, setGenres] = useState([]);
    const [moods, setMoods] = useState([]);
    const [isDataLoading, setIsDataLoading] = useState(true);

    // Khởi tạo state form từ dữ liệu bài hát hiện tại
    const [formData, setFormData] = useState({
        name: song.name, desc: song.desc || "", artistName: song.artistName,
        albumName: song.albumName, genre: song.genre || "",
        mood: song.mood || "", lyrics: song.lyrics || "",
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

    // ⚡️ EFFECT: Tải danh sách Thể loại và Tâm trạng
    useEffect(() => {
        const fetchData = async () => {
            try {
                const genrePromise = axios.get('http://localhost:4000/api/genre/list');
                const moodPromise = axios.get('http://localhost:4000/api/mood/list');

                const [genreResponse, moodResponse] = await Promise.all([genrePromise, moodPromise]);

                if (genreResponse.data.success) setGenres(genreResponse.data.genres);
                if (moodResponse.data.success) setMoods(moodResponse.data.moods);

            } catch (error) {
                toast.error("Lỗi khi tải danh sách Thể loại/Tâm trạng.");
            } finally {
                setIsDataLoading(false);
            }
        };
        fetchData();
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append('id', song._id);

        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        if (imageFile) data.append('image', imageFile);
        if (audioFile) data.append('audio', audioFile);

        try {
            // API cập nhật (đã được cấu hình để nhận FormData)
            const response = await axios.post('http://localhost:4000/api/song/update', data);

            if (response.data.success) {
                toast.success(response.data.message);
                onClose(true);
            } else {
                toast.error(response.data.message || "Cập nhật thất bại.");
            }
        } catch (error) {
            toast.error("Lỗi kết nối hoặc server khi cập nhật.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isDataLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                <p className="text-white p-5 rounded bg-gray-700">Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-2xl w-full max-w-2xl m-4">
                <div className="flex justify-between items-center mb-6 border-b pb-2">
                    <h3 className="text-2xl font-bold text-gray-800">Chỉnh Sửa Bài Hát: {song.name}</h3>
                    <button onClick={() => onClose(false)} className="text-gray-500 hover:text-red-600 text-3xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Tên Bài Hát Inputs */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tên Bài Hát</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" required />
                    </div>

                    {/* Nghệ Sĩ & Album Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tên Nghệ Sĩ</label>
                            <input type="text" name="artistName" value={formData.artistName} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tên Album (Ghi 'none' nếu không có)</label>
                            <input type="text" name="albumName" value={formData.albumName} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                    </div>

                    {/* Thể Loại & Tâm Trạng (SELECT) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* 1. THỂ LOẠI */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Thể Loại (Genre)</label>
                            <select
                                name="genre"
                                value={formData.genre}
                                onChange={handleChange}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white"
                                required
                            >
                                <option value="" disabled>-- Chọn Thể Loại --</option>
                                {genres.map(g => (
                                    <option key={g._id} value={g.name}>{g.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* 2. TÂM TRẠNG (MOOD) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tâm Trạng (Mood)</label>
                            <select
                                name="mood"
                                value={formData.mood}
                                onChange={handleChange}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white"
                            >
                                <option value="">-- Chọn Tâm Trạng --</option>
                                {moods.map(m => (
                                    <option key={m._id} value={m.name}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Mô tả, Lyrics, File Uploads */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mô Tả</label>
                        <textarea name="desc" value={formData.desc} onChange={handleChange} rows="2" className="mt-1 w-full p-2 border border-gray-300 rounded-md"></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Lời Bài Hát (Lyrics)</label>
                        <textarea name="lyrics" value={formData.lyrics} onChange={handleChange} rows="4" className="mt-1 w-full p-2 border border-gray-300 rounded-md"></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {/* Ảnh Bìa */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Thay đổi Ảnh Bìa</label>
                            <input type="file" name="image" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} className="mt-1 w-full text-sm text-gray-500" />
                            {imageFile ? <p className="text-green-600 text-xs">Đã chọn file ảnh mới.</p> : <p className="text-gray-500 text-xs">Giữ nguyên ảnh cũ nếu không chọn.</p>}
                        </div>
                        {/* File Nhạc */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Thay đổi File Nhạc</label>
                            <input type="file" name="audio" accept="audio/*" onChange={(e) => handleFileChange(e, 'audio')} className="mt-1 w-full p-2 text-sm text-gray-500" />
                            {audioFile ? <p className="text-green-600 text-xs">Đã chọn file nhạc mới.</p> : <p className="text-gray-500 text-xs">Giữ nguyên nhạc cũ nếu không chọn.</p>}
                        </div>
                    </div>


                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-150 disabled:bg-gray-400">
                            {isSubmitting ? 'Đang Cập Nhật...' : 'Lưu Thay Đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditSongModal;