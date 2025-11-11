import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AddSongToPlaylistModal } from './AddSongToPlaylistModal'; // Sử dụng Named Import

const ManagePlaylistModal = ({ playlist, onClose }) => {
    // 1. STATE
    const [details, setDetails] = useState(null);
    const [newName, setNewName] = useState(playlist.name);
    const [newIsPublic, setNewIsPublic] = useState(playlist.isPublic); // Dù Controller force true, ta vẫn lấy giá trị gốc
    const [isLoading, setIsLoading] = useState(true);
    const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);

    // Hàm định dạng thời gian
    const formatTime = (seconds) => String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(Math.round(seconds % 60)).padStart(2, '0');

    // 2. FETCH DETAILS
    const fetchDetails = async () => {
        setIsLoading(true);
        try {
            // Lấy chi tiết playlist để đảm bảo danh sách bài hát là mới nhất
            const response = await axios.get(`http://localhost:4000/api/playlist/${playlist._id}`);
            if (response.data.success) {
                setDetails(response.data.playlist);
                setNewName(response.data.playlist.name);
                setNewIsPublic(response.data.playlist.isPublic);
            } else {
                toast.error(response.data.message || "Không thể tải chi tiết playlist.");
            }
        } catch (error) {
            toast.error("Lỗi kết nối khi tải chi tiết playlist.");
            onClose(); // Đóng modal nếu lỗi nghiêm trọng
        } finally {
            setIsLoading(false);
        }
    };

    // 3. LOGIC SỬA TÊN/CÔNG KHAI
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:4000/api/playlist/update/${playlist._id}`, {
                name: newName,
                isPublic: newIsPublic, // Gửi giá trị (Controller sẽ force TRUE nếu cần)
            });
            toast.success(response.data.message);
            onClose(true); // Tải lại ListPlaylist
        } catch (error) {
            toast.error("Cập nhật thất bại.");
        }
    };

    // 4. LOGIC GỠ BÀI HÁT
    const removeSong = async (songId) => {
        if (!window.confirm("Gỡ bài hát khỏi playlist này?")) return;

        try {
            const response = await axios.post(`http://localhost:4000/api/playlist/song/remove`, {
                playlistId: playlist._id,
                songId: songId,
            });
            // Cập nhật state cục bộ và yêu cầu tải lại danh sách chính
            setDetails(response.data.playlist);
            toast.success(response.data.message);
            onClose(true);
        } catch (error) {
            toast.error("Gỡ bài hát thất bại.");
        }
    };

    // 5. XỬ LÝ KHI THÊM BÀI HÁT THÀNH CÔNG TỪ MODAL PHỤ
    const handleSongsAdded = (updatedPlaylist) => {
        setDetails(updatedPlaylist); // Cập nhật danh sách bài hát ngay lập tức
        setIsAddSongModalOpen(false); // Đóng modal phụ
        onClose(true); // Yêu cầu tải lại ListPlaylist chính
    };


    // 6. USE EFFECT
    useEffect(() => {
        fetchDetails();
    }, [playlist._id, onClose]);

    // 7. RENDER
    if (isLoading || !details) return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <p className="text-white">Đang tải chi tiết playlist...</p>
        </div>
    );

    const songList = details.songs || [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-4xl m-4 h-[90vh] flex flex-col">
                <h3 className="text-2xl font-bold mb-4">Quản Lý Playlist: {details.name}</h3>

                {/* Khu vực sửa tên/công khai */}
                <form onSubmit={handleUpdate} className="flex gap-4 p-3 border-b mb-4 bg-gray-50 rounded">
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required className="p-2 border rounded flex-1" />
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="isPublicEdit" checked={newIsPublic} onChange={(e) => setNewIsPublic(e.target.checked)} />
                        <label htmlFor="isPublicEdit" className="text-sm">Public (Controller sẽ Force)</label>
                    </div>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Lưu Thay Đổi</button>
                </form>

                <div className="flex justify-between items-center mb-3 mt-2">
                    <h4 className="text-xl font-semibold">Danh Sách Bài Hát ({songList.length})</h4>

                    {/* NÚT MỞ MODAL THÊM BÀI HÁT */}
                    <button onClick={() => setIsAddSongModalOpen(true)} className="px-3 py-1 bg-green-600 text-white rounded-md">
                        + Thêm Bài Hát
                    </button>
                </div>

                {/* Bảng Bài Hát */}
                <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                    {songList.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs">#</th>
                                    <th className="px-4 py-2 text-left text-xs">Bài hát</th>
                                    <th className="px-4 py-2 text-left text-xs">Thời lượng</th>
                                    <th className="px-4 py-2 text-left text-xs">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {songList.map((song, index) => (
                                    <tr key={song._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 text-sm">{index + 1}</td>
                                        <td className="px-4 py-2 text-sm font-medium">{song.name}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{formatTime(song.duration)}</td>
                                        <td className="px-4 py-2 text-sm">
                                            <button onClick={() => removeSong(song._id)} className="text-red-600 hover:text-red-900 font-semibold text-xs">
                                                Gỡ
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="p-4 text-gray-500">Playlist này chưa có bài hát nào.</p>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <button onClick={() => onClose(false)} className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
                        Đóng
                    </button>
                </div>
            </div>

            {/* Modal Thêm Bài Hát Phụ */}
            {isAddSongModalOpen && (
                <AddSongToPlaylistModal
                    playlistId={details._id}
                    playlistName={details.name}
                    onClose={() => setIsAddSongModalOpen(false)}
                    onSongsAdded={handleSongsAdded}
                    currentSongsInPlaylist={details.songs || []} // Truyền danh sách bài hát hiện tại
                />
            )}
        </div>
    );
};

export default ManagePlaylistModal;