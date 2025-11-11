import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";


// Middleware xác thực người dùng qua JWT
export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Thiếu token xác thực" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecret");

        const user = await userModel.findById(decoded._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Lỗi xác thực JWT:", error);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token đã hết hạn, vui lòng đăng nhập lại" });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Token không hợp lệ" });
        }
        return res.status(500).json({ message: "Lỗi xác thực máy chủ" });
    }
};

// Middleware chỉ cho admin truy cập
export const verifyAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Chưa xác thực người dùng" });
    }
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Chỉ admin mới có quyền thực hiện hành động này" });
    }
    next();
};
