// moodRoute.js
import express from 'express';
import { addMood, listMood } from '../controllers/moodController.js';
// Giả định authMiddleware cho Admin Panel

const moodRouter = express.Router();

// Tuyến đường Admin để thêm/khởi tạo tâm trạng
moodRouter.post('/add', addMood);

// Tuyến đường Public/User để lấy danh sách tâm trạng
moodRouter.get('/list', listMood);

export default moodRouter;