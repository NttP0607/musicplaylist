import express from 'express';
import upload from '../middleware/multer.js'; // Giả định multer
import {
    addAlbum, listAlbum, getAlbumById, updateAlbum, removeAlbum, searchAlbum,
    addSongToAlbum, removeSongFromAlbum
} from '../controllers/albumController.js';

const albumRouter = express.Router();
const imageUploadMiddleware = upload.single('image');

albumRouter.post('/add', imageUploadMiddleware, addAlbum);
albumRouter.post('/update/:id', imageUploadMiddleware, updateAlbum);
albumRouter.get('/list', listAlbum);
albumRouter.get('/:id', getAlbumById);
albumRouter.get('/search', searchAlbum);
albumRouter.post('/remove', removeAlbum);

// Chức năng Xử lý Bài hát trong Album
albumRouter.post('/songs/add', addSongToAlbum);
albumRouter.post('/songs/remove', removeSongFromAlbum);

export default albumRouter;