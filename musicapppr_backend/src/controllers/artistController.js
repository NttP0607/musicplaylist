import { v2 as cloudinary } from "cloudinary";
import artistModel from "../models/artistModel.js";
import mongoose from "mongoose";
import songModel from "../models/songModel.js";
import albumModel from "../models/albumModel.js";

// 🎨 Thêm nghệ sĩ (upload ảnh)
const addArtist = async (req, res) => {
    try {
        const { name, bio } = req.body;
        const imageFile = req.file;

        if (!name) {
            return res.status(400).json({ success: false, message: "Tên nghệ sĩ là bắt buộc" });
        }

        let imageUpload = null;
        if (imageFile) {
            try {
                imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                    resource_type: "image",
                    folder: "artists",
                });
            } catch (uploadError) {
                return res.status(500).json({ success: false, message: "Lỗi tải ảnh lên Cloudinary" });
            }
        }

        const newArtist = new artistModel({
            name, bio,
            image: imageUpload ? imageUpload.secure_url : "",
        });

        await newArtist.save();
        res.status(201).json({ success: true, message: "Thêm nghệ sĩ thành công", artist: newArtist });
    } catch (error) {
        console.error("Add artist error:", error);
        res.status(500).json({ success: false, message: "Failed to add artist" });
    }
};
const getArtistById = async (req, res) => {
    try {
        const { id } = req.params;
        // Thêm kiểm tra ID hợp lệ
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID nghệ sĩ không hợp lệ" });
        }

        const artist = await artistModel.findById(id);
        if (!artist) return res.status(404).json({ success: false, message: "Không tìm thấy nghệ sĩ" }); // Trả về 404

        res.json({ success: true, artist });
    } catch (error) {
        console.error("Get artist error:", error);
        res.status(500).json({ success: false, message: "Error fetching artist" });
    }
};


// 🎭 Lấy danh sách nghệ sĩ
const listArtist = async (req, res) => {
    try {
        const artists = await artistModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, artists });
    } catch (error) {
        console.error("List artist error:", error);
        res.status(500).json({ success: false, message: "Cannot list artists" });
    }
};


const updateArtist = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, bio } = req.body;
        const imageFile = req.file; // ✅ Sửa: Dùng req.file (vì route dùng upload.single)

        const artist = await artistModel.findById(id);
        if (!artist) return res.status(404).json({ success: false, message: "Không tìm thấy nghệ sĩ" }); // Trả về 404

        // 📤 Nếu có ảnh mới, upload lên Cloudinary
        if (imageFile) {
            try {
                const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                    resource_type: "image",
                    folder: "artists",
                });
                artist.image = imageUpload.secure_url;
            } catch (uploadError) {
                return res.status(500).json({ success: false, message: "Lỗi tải ảnh mới lên Cloudinary" });
            }
        }

        if (name) artist.name = name;
        if (bio) artist.bio = bio;

        await artist.save();

        res.json({ success: true, message: "Cập nhật nghệ sĩ thành công", artist });
    } catch (error) {
        console.error("Update artist error:", error);
        res.status(500).json({ success: false, message: "Failed to update artist" });
    }
};
const removeArtist = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ success: false, message: "Missing artist ID" });

        const deletedArtist = await artistModel.findByIdAndDelete(id);
        if (!deletedArtist) return res.status(404).json({ success: false, message: "Không tìm thấy nghệ sĩ" });

        // 🚨 QUAN TRỌNG: Cập nhật tham chiếu cho các mô hình khác

        // 1. Gỡ tham chiếu Nghệ sĩ khỏi tất cả các Bài hát
        await songModel.updateMany(
            { artist: id },
            { $set: { artist: null } }
        );

        // 2. Gỡ tham chiếu Nghệ sĩ khỏi tất cả các Album
        await albumModel.updateMany(
            { artist: id },
            { $set: { artist: null } }
        );

        res.json({ success: true, message: "Xóa nghệ sĩ thành công" });
    } catch (error) {
        console.error("Remove artist error:", error);
        res.status(500).json({ success: false, message: "Failed to delete artist" });
    }
};

// 🔍 Tìm kiếm nghệ sĩ theo tên
const searchArtist = async (req, res) => {
    try {
        const { keyword } = req.query;
        if (!keyword?.trim()) {
            return res.status(400).json({ success: false, message: "Missing search keyword" });
        }

        const regex = new RegExp(keyword, "i");
        const matchedArtists = await artistModel.find({ name: regex });

        res.json({ success: true, artists: matchedArtists });
    } catch (error) {
        console.error("Search artist error:", error);
        res.status(500).json({ success: false, message: "Search failed" });
    }
};

export { addArtist, listArtist, getArtistById, updateArtist, removeArtist, searchArtist };
