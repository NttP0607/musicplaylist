import express from 'express';
import upload from '../middleware/multer.js';
import {
    addArtist,
    listArtist,
    getArtistById,
    updateArtist,
    removeArtist,
    searchArtist
} from '../controllers/artistController.js';

const artistRouter = express.Router();

// ➕ Thêm nghệ sĩ mới
artistRouter.post('/add', upload.single('image'), addArtist);

// 📋 Lấy danh sách nghệ sĩ
artistRouter.get('/list', listArtist);

// 🔍 Tìm kiếm nghệ sĩ theo tên
artistRouter.get('/search', searchArtist);

// 📖 Xem chi tiết nghệ sĩ theo ID
artistRouter.get('/:id', getArtistById);

// ✏️ Cập nhật thông tin nghệ sĩ
artistRouter.put('/update/:id', upload.single('image'), updateArtist);

// ❌ Xóa nghệ sĩ
artistRouter.post('/remove', removeArtist);

export default artistRouter;
