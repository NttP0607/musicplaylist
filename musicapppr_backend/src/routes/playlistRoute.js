// 📂 playlistRoute.js (Đã sửa để BỎ QUA XÁC THỰC)

import express from 'express';
import {
    addPlaylist,
    listPlaylists,
    getPlaylistById,
    updatePlaylist,
    removePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist
} from '../controllers/playlistController.js';

// KHÔNG IMPORT verifyToken

const playlistRouter = express.Router();

// 🚨 TẠO MIDDLEWARE GIẢ TẠM THỜI
// Nó sẽ luôn gọi next(), bỏ qua việc kiểm tra token.
const skipAuth = (req, res, next) => {

    // Gán một user mẫu để controller không bị crash khi truy cập req.user
    // Gán role: 'admin' để Admin Panel hoạt động
    req.user = {
        _id: '600000000000000000000001',
        role: 'admin'
    };
    next();
};

// ------------------- Tuyến đường Playlist (Sử dụng skipAuth) -------------------

// 🟢 Tạo Playlist mới 
playlistRouter.post('/add', skipAuth, addPlaylist);

// 🔵 Lấy danh sách Playlist 
playlistRouter.get('/list', skipAuth, listPlaylists); // ✅ FIX: Tuyến đường này sẽ hoạt động

// 🟣 Lấy chi tiết Playlist theo ID
playlistRouter.get('/:id', skipAuth, getPlaylistById);

// 🟠 Cập nhật Playlist
playlistRouter.put('/update/:id', skipAuth, updatePlaylist);

// 🔴 Xóa Playlist
playlistRouter.post('/remove', skipAuth, removePlaylist);

// ➕ Thêm Bài hát
playlistRouter.post('/song/add', skipAuth, addSongToPlaylist);

// ➖ Gỡ Bài hát
playlistRouter.post('/song/remove', skipAuth, removeSongFromPlaylist);


export default playlistRouter;