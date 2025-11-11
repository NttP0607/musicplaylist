import { v2 as cloudinary } from 'cloudinary';
import songModel from '../models/songModel.js';
import artistModel from '../models/artistModel.js';
import albumModel from '../models/albumModel.js';
import genreModel from '../models/genreModel.js'; // Cần cho Genre ID
import moodModel from '../models/moodModel.js';   // Cần cho Mood ID
import mongoose from 'mongoose';

// ------------------------------------------------------------------
//                             HELPER
// ------------------------------------------------------------------

/**
 * Lấy các ObjectId từ tên (String) cho Genre hoặc Mood.
 * @param {string | string[]} names - Tên thể loại hoặc tâm trạng từ form.
 * @param {mongoose.Model} model - Mô hình Mongoose (GenreModel hoặc MoodModel).
 * @returns {Promise<mongoose.Types.ObjectId[]>} Mảng các ID hợp lệ.
 */
const getIdsByName = async (names, model) => {
    if (!names) return [];

    // Đảm bảo là mảng (vì Schema là mảng), ngay cả khi chỉ nhận 1 giá trị từ <select>
    const nameArray = Array.isArray(names) ? names : [names];

    const validNames = nameArray.filter(name => name && name.trim() !== "");

    if (validNames.length === 0) return [];

    // Tìm kiếm các ObjectId dựa trên tên
    const foundItems = await model.find({ name: { $in: validNames.map(n => n.trim()) } }).select('_id');

    return foundItems.map(item => item._id);
};

// ------------------------------------------------------------------
//                             ADD SONG
// ------------------------------------------------------------------

const addSong = async (req, res) => {
    try {
        const { name, desc, artistName, albumName, genre, mood, lyrics } = req.body;
        const imageFile = req.files?.image?.[0];
        const audioFile = req.files?.audio?.[0];

        if (!name || !artistName || !audioFile) {
            return res.status(400).json({ success: false, message: "Missing required fields: name, artistName, and audio file" });
        }

        // 1. Tìm Artist
        let artist = await artistModel.findOne({ name: artistName });
        if (!artist) {
            artist = new artistModel({ name: artistName });
            await artist.save();
        }

        // 2. Tìm Album
        let album = null;
        if (albumName && albumName !== "none") {
            album = await albumModel.findOne({ name: albumName });
            if (!album) return res.status(404).json({ success: false, message: "Album not found" });
        }

        // 3. Chuyển đổi Tên thành ID (FIX: Genre và Mood)
        const genreIds = await getIdsByName(genre, genreModel);
        const moodIds = await getIdsByName(mood, moodModel);

        // 4. Upload ảnh & file nhạc
        const imageUpload = imageFile
            ? await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            : null;

        const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
            resource_type: "video",
            folder: "songs",
        });
        const duration = Math.round(audioUpload.duration);

        // 5. Tạo bài hát mới
        const newSong = new songModel({
            name, desc, artist: artist._id,
            album: album ? album._id : null,
            genres: genreIds, // ✅ Gán MẢNG ID
            moods: moodIds,   // ✅ Gán MẢNG ID
            lyrics,
            image: imageUpload ? imageUpload.secure_url : "",
            file: audioUpload.secure_url,
            duration,
        });

        await newSong.save();

        // 6. Cập nhật Album
        if (album) {
            album.songs.push(newSong._id);
            await album.save();
        }

        res.json({ success: true, message: "Song added successfully", song: newSong });
    } catch (error) {
        console.error("Add song error:", error);
        res.status(500).json({ success: false, message: "Failed to add song" });
    }
};

// ------------------------------------------------------------------
//                           UPDATE SONG
// ------------------------------------------------------------------

const updateSong = async (req, res) => {
    try {
        const { id, name, desc, artistName, albumName, genre, mood, lyrics } = req.body;
        const imageFile = req.files?.image?.[0];
        const audioFile = req.files?.audio?.[0];

        if (!id) return res.status(400).json({ success: false, message: "Missing song ID" });

        const existingSong = await songModel.findById(id);
        if (!existingSong) return res.status(404).json({ success: false, message: "Song not found" });

        const updatedData = {};

        // 1. Xử lý Artist
        if (artistName) {
            let artist = await artistModel.findOne({ name: artistName });
            if (!artist) {
                artist = new artistModel({ name: artistName });
                await artist.save();
            }
            updatedData.artist = artist._id;
        }

        // 2. Xử lý Genre/Mood (FIX: Chuyển đổi Tên thành ID)
        if (genre !== undefined) updatedData.genres = await getIdsByName(genre, genreModel);
        if (mood !== undefined) updatedData.moods = await getIdsByName(mood, moodModel);

        // 3. Xử lý Album
        if (albumName !== undefined) {
            const oldAlbumId = existingSong.album;

            // Gỡ khỏi album cũ
            if (oldAlbumId) {
                await albumModel.findByIdAndUpdate(oldAlbumId, { $pull: { songs: id } });
            }

            // Thêm vào album mới
            if (albumName && albumName !== "none") {
                const newAlbum = await albumModel.findOne({ name: albumName });
                if (!newAlbum) return res.status(404).json({ success: false, message: "New album not found" });

                await albumModel.findByIdAndUpdate(newAlbum._id, { $addToSet: { songs: id } });
                updatedData.album = newAlbum._id;
            } else {
                updatedData.album = null;
            }
        }

        // 4. Xử lý File Uploads
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            updatedData.image = imageUpload.secure_url;
        }

        if (audioFile) {
            const audioUpload = await cloudinary.uploader.upload(audioFile.path, { resource_type: "video", folder: "songs" });
            updatedData.file = audioUpload.secure_url;
            updatedData.duration = Math.round(audioUpload.duration);
        }

        // 5. Cập nhật trường đơn
        if (name) updatedData.name = name;
        if (desc) updatedData.desc = desc;
        if (lyrics) updatedData.lyrics = lyrics;

        const updatedSong = await songModel.findByIdAndUpdate(id, updatedData, { new: true });

        res.json({ success: true, message: "Song updated successfully", song: updatedSong });

    } catch (error) {
        console.error("Update song error:", error);
        res.status(500).json({ success: false, message: "Failed to update song" });
    }
};

// ------------------------------------------------------------------
//                        READ/DELETE/SEARCH
// ------------------------------------------------------------------

const listSong = async (req, res) => {
    try {
        const allSongs = await songModel.find({})
            .populate("album", "name")
            .populate("artist", "name")
            .populate("genres", "name") // 
            .populate("moods", "name");
        res.json({ success: true, songs: allSongs });
    } catch (error) {
        console.error("List song error:", error);
        res.status(500).json({ success: false, message: "Cannot list songs" });
    }
};

const removeSong = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ success: false, message: "Missing song ID" });

        const songToDelete = await songModel.findByIdAndDelete(id);
        if (!songToDelete) return res.status(404).json({ success: false, message: "Song not found" });

        // Xóa tham chiếu khỏi album (nếu có)
        if (songToDelete.album) {
            await albumModel.findByIdAndUpdate(
                songToDelete.album,
                { $pull: { songs: songToDelete._id } }
            );
        }
        res.json({ success: true, message: "Song removed successfully" });
    } catch (error) {
        console.error("Remove song error:", error);
        res.status(500).json({ success: false, message: "Remove failed" });
    }
};

const searchSong = async (req, res) => {
    try {
        const query = req.query.query;
        if (!query?.trim()) {
            return res.status(400).json({ success: false, message: "Missing search query" });
        }

        const regex = new RegExp(query, "i");
        const matchedSongs = await songModel.find({
            $or: [
                { name: regex },
                { desc: regex },
                // Tìm kiếm theo tên của genres/moods (chú ý: đây là tìm kiếm string, không phải ObjectId)
                { genre: regex },
                { mood: regex }
            ]
        }).populate("artist", "name")
            .populate("genres", "name")
            .populate("moods", "name");

        res.json({ success: true, songs: matchedSongs });
    } catch (error) {
        console.error("Search song error:", error);
        res.status(500).json({ success: false, message: "Search failed" });
    }
};


export { addSong, updateSong, listSong, removeSong, searchSong };