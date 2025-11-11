// genreController.js
import genreModel from '../models/genreModel.js';
import mongoose from 'mongoose';

// Danh sách các thể loại mặc định (Pop, Rock, EDM, ...)
const defaultGenres = [
    { name: "Pop", description: "Nhạc đại chúng" },
    { name: "Rock", description: "Nhạc Rock" },
    { name: "EDM", description: "Nhạc điện tử" },
    { name: "Hip-Hop", description: "Hip-Hop/Rap" },
    { name: "Jazz", description: "Nhạc Jazz" },
    { name: "Classical", description: "Nhạc cổ điển" },
    { name: "K-Pop", description: "Nhạc Pop Hàn Quốc" },
    { name: "R&B", description: "Rhythm and Blues" },
    { name: "Remix", description: "Nhạc phối lại" },
];

/**
 * 🟢 Thêm (hoặc Khởi tạo) Thể loại mới
 * Nếu name đã tồn tại, sẽ bỏ qua.
 */
const addGenre = async (req, res) => {
    try {
        const { name, description, parentGenre } = req.body;

        // Nếu không có input, ta có thể chạy khởi tạo mặc định
        if (!name) {
            // ⚡️ Chức năng Khởi tạo Thể loại Mặc định
            await initializeDefaultGenres();
            return res.json({ success: true, message: "Đã khởi tạo các thể loại mặc định." });
        }

        const existingGenre = await genreModel.findOne({ name: name.trim() });
        if (existingGenre) {
            return res.status(400).json({ success: false, message: "Thể loại đã tồn tại" });
        }

        const newGenre = new genreModel({ name: name.trim(), description, parentGenre });
        await newGenre.save();
        res.status(201).json({ success: true, message: "Thêm thể loại thành công", genre: newGenre });

    } catch (error) {
        console.error("Add genre error:", error);
        res.status(500).json({ success: false, message: "Failed to add genre" });
    }
};

/**
 * 🔵 Lấy danh sách tất cả Thể loại
 */
const listGenre = async (req, res) => {
    try {
        const genres = await genreModel.find({}).sort({ name: 1 });
        res.json({ success: true, genres });
    } catch (error) {
        console.error("List genre error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch genres" });
    }
};

/**
 * ⚡️ Helper: Chèn các thể loại mặc định vào DB nếu chúng chưa tồn tại
 */
const initializeDefaultGenres = async () => {
    for (const g of defaultGenres) {
        // Sử dụng $setOnInsert để chỉ chèn nếu tên không tồn tại (tránh lỗi unique)
        await genreModel.findOneAndUpdate(
            { name: g.name },
            { $setOnInsert: { name: g.name, description: g.description } },
            { upsert: true, new: true, runValidators: true }
        );
    }
};

// ... (Bạn có thể thêm các hàm updateGenre, removeGenre tương tự như artistController) ...

export { addGenre, listGenre, initializeDefaultGenres }; // Export thêm initializeDefaultGenres