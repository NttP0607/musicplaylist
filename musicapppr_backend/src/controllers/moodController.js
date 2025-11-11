// moodController.js
import moodModel from '../models/moodModel.js';

// Danh sách các tâm trạng mặc định
const defaultMoods = [
    { name: "Happy", color: "#FFC300", description: "Vui vẻ, phấn khởi" },
    { name: "Relax", color: "#3BFFD5", description: "Thư giãn, nhẹ nhàng" },
    { name: "Sad", color: "#1D52FF", description: "Buồn bã, cô đơn" },
    { name: "Calm", color: "#7F4EAA", description: "Bình tĩnh, tĩnh lặng" },
    { name: "Powerful", color: "#FF5733", description: "Mạnh mẽ, tự tin" },
    { name: "Romantic", color: "#FF33F6", description: "Lãng mạn, mơ mộng" },
    { name: "Love", color: "#FF3333", description: "Yêu thương, ấm áp" },
    { name: "Anxiety", color: "#FF9933", description: "Lo lắng, căng thẳng" },
    { name: "Anger", color: "#B30000", description: "Tức giận, giận dữ" },
    { name: "Pride", color: "#77FF33", description: "Tự hào, kiêu hãnh" },
    { name: "Longing", color: "#336EFF", description: "Hoài niệm, nhớ nhung" },
];

/**
 * 🟢 Thêm (hoặc Khởi tạo) Tâm trạng mới
 */
const addMood = async (req, res) => {
    try {
        const { name, color, icon, description } = req.body;

        // ⚡️ Chức năng Khởi tạo Mặc định (Nếu không có input name)
        if (!name) {
            await initializeDefaultMoods();
            return res.json({ success: true, message: "Đã khởi tạo các tâm trạng mặc định." });
        }

        const existingMood = await moodModel.findOne({ name: name.trim() });
        if (existingMood) {
            return res.status(400).json({ success: false, message: "Tâm trạng đã tồn tại" });
        }

        const newMood = new moodModel({ name: name.trim(), color, icon, description });
        await newMood.save();
        res.status(201).json({ success: true, message: "Thêm tâm trạng thành công", mood: newMood });

    } catch (error) {
        console.error("Add mood error:", error);
        res.status(500).json({ success: false, message: "Failed to add mood" });
    }
};

/**
 * 🔵 Lấy danh sách tất cả Tâm trạng
 */
const listMood = async (req, res) => {
    try {
        const moods = await moodModel.find({}).sort({ name: 1 });
        res.json({ success: true, moods });
    } catch (error) {
        console.error("List mood error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch moods" });
    }
};

/**
 * ⚡️ Helper: Chèn các tâm trạng mặc định vào DB nếu chúng chưa tồn tại
 */
const initializeDefaultMoods = async () => {
    for (const m of defaultMoods) {
        await moodModel.findOneAndUpdate(
            { name: m.name },
            { $setOnInsert: m },
            { upsert: true, new: true, runValidators: true }
        );
    }
};

export { addMood, listMood, initializeDefaultMoods };