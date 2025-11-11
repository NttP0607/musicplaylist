import React from 'react';

const DetailSongModal = ({ song, onClose, formatDuration }) => {
    if (!song) return null;

    // Helper để biến mảng object thành chuỗi tên, hoặc trả về 'N/A'
    const getNames = (arr) => {
        if (Array.isArray(arr) && arr.length > 0) {
            // Kiểm tra xem phần tử có phải là object (đã populate) và lấy .name
            return arr.map(item => item.name || item).join(', ');
        }
        return 'N/A';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-2xl w-full max-w-lg m-4">
                <div className="flex justify-between items-center mb-6 border-b pb-2">
                    <h3 className="text-2xl font-bold text-gray-800">Chi Tiết Bài Hát</h3>
                    <button onClick={() => onClose(false)} className="text-gray-500 hover:text-red-600 text-3xl">&times;</button>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-center mb-4">
                        <img
                            src={song.image || ''}
                            alt={song.name}
                            className="w-32 h-32 object-cover rounded-lg shadow-md"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <p className="font-semibold text-gray-700">Tên:</p>
                        <p className="text-gray-800 break-words">{song.name}</p>

                        <p className="font-semibold text-gray-700">Nghệ Sĩ:</p>
                        <p className="text-gray-800">{song.artist?.name || 'N/A'}</p>

                        <p className="font-semibold text-gray-700">Album:</p>
                        <p className="text-gray-800">{song.album?.name || 'Độc lập'}</p>

                        <p className="font-semibold text-gray-700">Thời Lượng:</p>
                        <p className="text-gray-800">{formatDuration(song.duration || 0)}</p>

                        {/* ✅ SỬA: Hiển thị TÊN Thể Loại */}
                        <p className="font-semibold text-gray-700">Thể Loại:</p>
                        <p className="text-gray-800">
                            {getNames(song.genres)}
                        </p>

                        {/* ✅ SỬA: Hiển thị TÊN Tâm Trạng */}
                        <p className="font-semibold text-gray-700">Tâm Trạng:</p>
                        <p className="text-gray-800">
                            {getNames(song.moods)}
                        </p>
                    </div>

                    <div className="pt-2">
                        <p className="font-semibold text-gray-700 mb-1">Mô Tả:</p>
                        <p className="text-gray-800 whitespace-pre-wrap">{song.desc || 'Không có mô tả.'}</p>
                    </div>

                    <div className="pt-2">
                        <p className="font-semibold text-gray-700 mb-1">Lời Bài Hát (Lyrics):</p>
                        <p className="text-gray-800 whitespace-pre-wrap h-32 overflow-y-auto border p-2 rounded bg-gray-50">
                            {song.lyrics || 'Không có lời bài hát.'}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button onClick={() => onClose(false)} className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition duration-150">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailSongModal;