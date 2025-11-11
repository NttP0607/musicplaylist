import express from 'express';
import { addGenre, listGenre } from '../controllers/genreController.js';
// ❌ ĐÃ XÓA: import authMiddleware, { verifyAdmin } from '../middleware/authMiddleware.js';

const genreRouter = express.Router();

// 🟢 Tuyến đường Admin để thêm/khởi tạo thể loại (TẠM THỜI BỎ QUA AUTH)
// Lưu ý: Tuyến đường này hiện không được bảo vệ.
genreRouter.post('/add', addGenre);

// 🔵 Tuyến đường Public/User để lấy danh sách thể loại
genreRouter.get('/list', listGenre);

export default genreRouter;