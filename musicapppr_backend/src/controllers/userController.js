import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

// ========================================
// 📌 Đăng ký tài khoản
// ========================================
export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Thiếu thông tin cần thiết" });
        }

        // Kiểm tra email đã tồn tại
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email đã được sử dụng" });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo người dùng mới
        const newUser = new userModel({ username, email, password: hashedPassword });
        await newUser.save();

        // Xóa mật khẩu trước khi trả về
        const userWithoutPassword = newUser.toObject();
        delete userWithoutPassword.password;

        res.status(201).json({
            message: "Đăng ký thành công",
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// ========================================
// 🔐 Đăng nhập
// ========================================
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra người dùng
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email không tồn tại" });
        }

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu không chính xác" });
        }

        // Tạo token JWT
        const token = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_SECRET || "mysecret",
            { expiresIn: "7d" }
        );

        // Trả về kết quả
        res.status(200).json({
            message: "Đăng nhập thành công",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// ========================================
// 👤 Lấy thông tin người dùng (cần token)
// ========================================
export const getUserProfile = async (req, res) => {
    try {
        res.status(200).json({ user: req.user });
    } catch (error) {
        console.error("Lỗi lấy thông tin người dùng:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// ========================================
// ✏️ Cập nhật thông tin người dùng
// ========================================
export const updateUser = async (req, res) => {
    try {
        // ✅ Kiểm tra quyền
        if (req.user._id.toString() !== req.params.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Không có quyền cập nhật người khác" });
        }

        const { username } = req.body;
        let avatarUrl;

        // ✅ Nếu người dùng upload file avatar mới
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "user_avatars",
                resource_type: "image",
            });
            avatarUrl = result.secure_url;

            // Xóa file tạm sau khi upload
            fs.unlinkSync(req.file.path);
        }

        // ✅ Cập nhật user
        const updatedUser = await userModel.findByIdAndUpdate(
            req.params.id,
            {
                ...(username && { username }),
                ...(avatarUrl && { avatar: avatarUrl }),
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        res.status(200).json({
            message: "Cập nhật thành công",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Lỗi cập nhật:", error);
        res.status(500).json({ message: "Lỗi server khi cập nhật thông tin" });
    }
};

// ========================================
// 🚮 Xóa người dùng
// ========================================
export const deleteUser = async (req, res) => {
    try {
        if (req.user._id.toString() !== req.params.id && req.user.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Không có quyền xóa người khác" });
        }

        await userModel.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Đã xóa người dùng" });
    } catch (error) {
        console.error("Lỗi xóa:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};
// 🚪 Logout — client chỉ cần xoá token
export const logoutUser = async (req, res) => {
    try {
        // Thực ra backend không cần xử lý nhiều nếu dùng JWT
        // Chỉ cần thông báo client xoá token là xong
        res.status(200).json({ message: "Đăng xuất thành công, vui lòng xoá token ở phía client." });
    } catch (error) {
        console.error("Lỗi logout:", error);
        res.status(500).json({ message: "Lỗi server khi đăng xuất" });
    }
};
