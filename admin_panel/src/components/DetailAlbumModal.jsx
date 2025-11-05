// Cần tạo component này và đặt trong thư mục components/

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AddSongToAlbumModal from './AddSongToAlbumModal'; // Import modal thêm bài hát

const DetailAlbumModal = ({ albumId, onClose, refreshList }) => {
    const [albumDetails, setAlbumDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);

    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');
        return `${formattedMinutes}:${formattedSeconds}`;
    };

    const fetchDetails = async () => {
        setIsLoading(true);
        try {
            // API đã được thiết lập trong Controller để populate songs, artist
            const response = await axios.get(`http://localhost:4000/api/album/${albumId}`);
            if (response.data.success) {
                setAlbumDetails(response.data.album);
            } else {
                toast.error(response.data.message || "Không thể tải chi tiết album.");
            }
        } catch (error) {
            toast.error("Lỗi kết nối khi tải album.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [albumId]);

    const removeSongFromAlbum = async (songId) => {
        if (!window.confirm("Bạn có chắc chắn muốn gỡ bài hát này khỏi album?")) return;

        try {
            const response = await axios.post(`http://localhost:4000/api/album/songs/remove`, {
                albumId: albumDetails._id,
                songIds: [songId]
            });

            if (response.data.success) {
                toast.success("Đã gỡ bài hát thành công!");
                // Cập nhật chi tiết album trong modal với data mới từ server
                setAlbumDetails(response.data.album);
                if (refreshList) refreshList();
            } else {
                toast.error(response.data.message || "Gỡ bài hát thất bại.");
            }
        } catch (error) {
            toast.error("Lỗi khi gỡ bài hát.");
        }
    };

    const handleSongsAdded = (updatedAlbum) => {
        setAlbumDetails(updatedAlbum); // Cập nhật chi tiết album
        setIsAddSongModalOpen(false); // Đóng modal thêm
        if (refreshList) refreshList(); // Cập nhật list album chính
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                <p className="text-white">Đang tải chi tiết...</p>
            </div>
        );
    }

    if (!albumDetails) { return null; }

    const album = albumDetails;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-4xl m-4 h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">Chi Tiết Album: {album.name}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-600 text-3xl">&times;</button>
                </div>

                {/* Chi tiết Album */}
                <div className="flex gap-6 mb-6">
                    <img src={album.image} alt={album.name} className="w-40 h-40 object-cover rounded-lg shadow-md" />
                    <div>
                        <p className="text-sm text-gray-500">ALBUM</p>
                        <h1 className="text-4xl font-extrabold text-gray-900">{album.name}</h1>
                        <p className="mt-2 text-gray-700">{album.desc}</p>
                        <p className="mt-2 text-sm">
                            **Nghệ sĩ:** <span className="font-semibold">{album.artist?.name || 'N/A'}</span> |
                            **Bài hát:** <span className="font-semibold">{album.songs?.length || 0}</span>
                        </p>
                    </div>
                </div>

                {/* Danh Sách Bài Hát Header */}
                <div className="flex justify-between items-center mb-3 mt-2">
                    <h2 className="text-xl font-bold">Bài Hát ({album.songs?.length || 0})</h2>
                    <button
                        onClick={() => setIsAddSongModalOpen(true)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                        + Thêm Bài Hát
                    </button>
                </div>

                {/* Bảng Danh Sách Bài Hát */}
                <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                    {album.songs && album.songs.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-5/12">Tên bài hát</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Nghệ sĩ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Thời lượng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {album.songs.map((song, index) => (
                                    <tr key={song._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                                            <img src={song.image} alt={song.name} className="w-8 h-8 rounded-full object-cover mr-2" />
                                            {song.name}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">{song.artist?.name || 'N/A'}</td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{formatDuration(song.duration)}</td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => removeSongFromAlbum(song._id)}
                                                className="text-red-600 hover:text-red-900 font-semibold text-xs"
                                            >
                                                Gỡ khỏi Album
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="p-4 text-gray-500">Album này chưa có bài hát nào.</p>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
                        Đóng
                    </button>
                </div>
            </div>

            {/* Modal Thêm Bài Hát */}
            {isAddSongModalOpen && (
                <AddSongToAlbumModal
                    albumId={album._id}
                    albumName={album.name}
                    onClose={() => setIsAddSongModalOpen(false)}
                    onSongsAdded={handleSongsAdded}
                />
            )}
        </div>
    );
};

export default DetailAlbumModal;