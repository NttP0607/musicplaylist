import { v2 as cloudinary } from 'cloudinary';
import albumModel from '../models/albumModel.js';
import artistModel from '../models/artistModel.js';
import songModel from '../models/songModel.js';
import mongoose from 'mongoose'; // Cần thiết để kiểm tra ID

// --------------------------------------------------------------------------
//                         ALBUM CRUD OPERATIONS
// --------------------------------------------------------------------------

const addAlbum = async (req, res) => {
    try {
        const { name, desc, bgColor, artistName } = req.body;
        const imageFile = req.file;

        if (!name || !artistName) return res.status(400).json({ success: false, message: "Name and artist are required" });

        let artist = await artistModel.findOne({ name: artistName.trim() });
        if (!artist) {
            artist = new artistModel({ name: artistName.trim() });
            await artist.save();
        }

        let imageUpload = { secure_url: "" };
        if (imageFile) {
            try {
                imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            } catch (uploadError) {
                console.error("Cloudinary Upload Error:", uploadError);
                return res.status(500).json({ success: false, message: "Failed to upload album image" });
            }
        }

        const newAlbum = new albumModel({
            name: name.trim(), desc, artist: artist._id, bgColor, image: imageUpload.secure_url,
        });

        await newAlbum.save();
        res.status(201).json({ success: true, message: "Album added successfully", album: newAlbum });
    } catch (error) {
        console.error("Add album error:", error);
        res.status(500).json({ success: false, message: "Failed to add album" });
    }
};

const listAlbum = async (req, res) => {
    try {
        const albums = await albumModel.find({})
            .populate("artist", "name")
            .populate("songs", "name duration image");
        res.json({ success: true, albums });
    } catch (error) {
        console.error("List album error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch albums" });
    }
};

const getAlbumById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Album ID format" });
        }

        const album = await albumModel.findById(id)
            .populate("artist", "name")
            .populate("songs", "name duration image artist");

        if (!album) return res.status(404).json({ success: false, message: "Album not found" });

        res.json({ success: true, album });
    } catch (error) {
        console.error("Get album error:", error);
        res.status(500).json({ success: false, message: "Error fetching album" });
    }
};

const updateAlbum = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, desc, bgColor, artistName } = req.body;
        const imageFile = req.file;

        const album = await albumModel.findById(id);
        if (!album) return res.status(404).json({ success: false, message: "Album not found" });

        if (artistName) {
            let artist = await artistModel.findOne({ name: artistName.trim() });
            if (!artist) {
                artist = new artistModel({ name: artistName.trim() });
                await artist.save();
            }
            album.artist = artist._id;
        }

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            album.image = imageUpload.secure_url;
        }

        if (name) album.name = name.trim();
        if (desc) album.desc = desc;
        if (bgColor) album.bgColor = bgColor;

        await album.save();

        res.json({ success: true, message: "Album updated successfully", album });
    } catch (error) {
        console.error("Update album error:", error);
        res.status(500).json({ success: false, message: "Failed to update album" });
    }
};

const removeAlbum = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ success: false, message: "Missing album ID" });

        const deletedAlbum = await albumModel.findByIdAndDelete(id);
        if (!deletedAlbum) return res.status(404).json({ success: false, message: "Album not found" });

        // Cập nhật SongModel: Gỡ tham chiếu album khỏi tất cả các bài hát thuộc album này
        await songModel.updateMany(
            { album: id },
            { $set: { album: null } }
        );

        res.json({ success: true, message: "Album removed successfully" });
    } catch (error) {
        console.error("Delete album error:", error);
        res.status(500).json({ success: false, message: "Failed to delete album" });
    }
};

const searchAlbum = async (req, res) => {
    try {
        const { keyword } = req.query;
        if (!keyword || keyword.trim() === "") {
            return res.status(400).json({ success: false, message: "Missing keyword" });
        }

        const albums = await albumModel.find({
            name: { $regex: keyword, $options: "i" },
        }).populate("artist", "name");

        res.json({ success: true, albums });
    } catch (error) {
        console.error("Search album error:", error);
        res.status(500).json({ success: false, message: "Search failed" });
    }
};

// -------------------------------------------------------------
//                ⚡️ CHỨC NĂNG XỬ LÝ BÀI HÁT TRONG ALBUM ⚡️
// -------------------------------------------------------------

const addSongToAlbum = async (req, res) => {
    try {
        const { albumId, songIds } = req.body;

        if (!albumId || !songIds || songIds.length === 0) {
            return res.status(400).json({ success: false, message: "Album ID and Song IDs are required" });
        }

        // 1. Cập nhật Album: Thêm các ID bài hát mới
        const albumUpdate = await albumModel.findByIdAndUpdate(
            albumId,
            { $addToSet: { songs: { $each: songIds } } },
            { new: true }
        ).populate("songs", "name duration image artist"); // Populate lại để trả về data mới nhất

        if (!albumUpdate) return res.status(404).json({ success: false, message: "Album not found" });

        // 2. Cập nhật Bài hát: Gán albumId cho tất cả các bài hát này
        await songModel.updateMany(
            { _id: { $in: songIds } },
            { $set: { album: albumId } }
        );

        res.json({
            success: true,
            message: "Songs added to album successfully",
            album: albumUpdate
        });

    } catch (error) {
        console.error("Add song to album error:", error);
        res.status(500).json({ success: false, message: "Failed to add songs to album" });
    }
};


const removeSongFromAlbum = async (req, res) => {
    try {
        const { albumId, songIds } = req.body;

        if (!albumId || !songIds || songIds.length === 0) {
            return res.status(400).json({ success: false, message: "Album ID and Song IDs are required" });
        }

        // 1. Cập nhật Album: Gỡ các ID bài hát
        const albumUpdate = await albumModel.findByIdAndUpdate(
            albumId,
            { $pullAll: { songs: songIds } },
            { new: true }
        ).populate("songs", "name duration image artist"); // Populate lại để trả về data mới nhất

        if (!albumUpdate) return res.status(404).json({ success: false, message: "Album not found" });

        // 2. Cập nhật Bài hát: Đặt album field của các bài hát này thành null
        await songModel.updateMany(
            { _id: { $in: songIds } },
            { $set: { album: null } }
        );

        res.json({
            success: true,
            message: "Songs removed from album successfully",
            album: albumUpdate
        });

    } catch (error) {
        console.error("Remove song from album error:", error);
        res.status(500).json({ success: false, message: "Failed to remove songs from album" });
    }
};

export {
    addAlbum, listAlbum, getAlbumById, updateAlbum, removeAlbum, searchAlbum,
    addSongToAlbum, removeSongFromAlbum
};