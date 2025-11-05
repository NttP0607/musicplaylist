import express from 'express';
import upload from '../middleware/multer.js'; // Giả định middleware multer.js nằm trong thư mục 'middleware'
import { addSong, updateSong, listSong, removeSong, searchSong } from '../controllers/songController.js'; // Giả định songController.js nằm trong thư mục 'controllers'

const songRouter = express.Router();

songRouter.post('/add', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 }  // File âm thanh (bắt buộc)
]), addSong);
songRouter.post('/update', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
]), updateSong);
songRouter.get('/list', listSong);

songRouter.post('/remove', removeSong);

songRouter.get('/search', searchSong);

export default songRouter;