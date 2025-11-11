import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const AddSongModal = ({ onClose }) => {
    // States để lưu danh sách thể loại và tâm trạng từ API
    const [genres, setGenres] = useState([]);
    const [moods, setMoods] = useState([]);
    const [isDataLoading, setIsDataLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: "", desc: "", artistName: "", albumName: "none",
        genre: "", mood: "", lyrics: "",
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
                // Fetch Genres và Moods song song
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

        // ✅ Kiểm tra các trường bắt buộc
        if (!formData.name || !formData.artistName || !audioFile || !formData.genre) {
            toast.error("Vui lòng nhập Tên Bài Hát, Nghệ Sĩ, chọn File Nhạc và Thể loại.");
            return;
        }

        setIsSubmitting(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        if (imageFile) data.append('image', imageFile);
        if (audioFile) data.append('audio', audioFile);

        try {
            const response = await axios.post('http://localhost:4000/api/song/add', data);

            if (response.data.success) {
                toast.success(response.data.message);
                onClose(true);
            } else {
                toast.error(response.data.message || "Thêm bài hát thất bại.");
            }
        } catch (error) {
            toast.error("Lỗi kết nối hoặc server khi thêm bài hát.");
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
                    <h3 className="text-2xl font-bold text-gray-800">Thêm Bài Hát Mới</h3>
                    <button onClick={() => onClose(false)} className="text-gray-500 hover:text-red-600 text-3xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Tên Bài Hát & Nghệ Sĩ/Album */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tên Bài Hát <span className="text-red-500">*</span></label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md" required />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tên Nghệ Sĩ <span className="text-red-500">*</span></label>
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
                            <label className="block text-sm font-medium text-gray-700">Thể Loại (Genre) <span className="text-red-500">*</span></label>
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

                    {/* Mô Tả, Lyrics, File Uploads */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mô Tả</label>
                        <textarea name="desc" value={formData.desc} onChange={handleChange} rows="2" className="mt-1 w-full p-2 border border-gray-300 rounded-md"></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Lời Bài Hát (Lyrics)</label>
                        <textarea name="lyrics" value={formData.lyrics} onChange={handleChange} rows="4" className="mt-1 w-full p-2 border border-gray-300 rounded-md"></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ảnh Bìa (Tùy chọn)</label>
                            <input type="file" name="image" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} className="mt-1 w-full text-sm text-gray-500" />
                            {imageFile && <p className="text-green-600 text-xs">Đã chọn: {imageFile.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">File Nhạc <span className="text-red-500">*</span></label>
                            <input type="file" name="audio" accept="audio/*" onChange={(e) => handleFileChange(e, 'audio')} className="mt-1 w-full text-sm text-gray-500" required />
                            {audioFile && <p className="text-green-600 text-xs">Đã chọn: {audioFile.name}</p>}
                        </div>
                    </div>

                    {/* Nút Submit */}
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition duration-150 disabled:bg-gray-400">
                            {isSubmitting ? 'Đang Thêm...' : 'Thêm Bài Hát'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSongModal;