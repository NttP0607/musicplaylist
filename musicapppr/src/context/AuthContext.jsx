import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
// Cần import toast nếu bạn muốn dùng thông báo toast trong hàm (ví dụ: login/register error)
// import { toast } from "react-toastify"; 

// 1. Tạo Context
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    // Lấy giá trị ban đầu từ localStorage
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);

    // Tạo instance Axios cho các requests không cần token (Register, Login)
    const API = axios.create({
        baseURL: "http://localhost:4000/api/user",
    });

    // ⚡️ EFFECT QUAN TRỌNG: Thiết lập Header Authorization toàn cục cho Axios và quản lý localStorage
    useEffect(() => {
        if (token) {
            // Đính kèm token vào Header cho MỌI yêu cầu Axios sau khi đăng nhập
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Cập nhật localStorage
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", token);
        } else {
            // Xóa token và user khi đăng xuất
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        }
    }, [token, user]); // Chạy lại khi token hoặc user thay đổi

    // 📌 Đăng ký người dùng
    const register = async (username, email, password) => {
        try {
            // Dùng API instance không cần token
            const res = await API.post("/register", { username, email, password });
            // Logic register không tự động login, nên chỉ trả về dữ liệu.
            return res.data;
        } catch (err) {
            console.error("Lỗi đăng ký:", err.response?.data || err.message);
            throw err;
        }
    };

    // 🔐 Đăng nhập
    const login = async (email, password) => {
        try {
            const res = await API.post("/login", { email, password });

            // ✅ Cập nhật state (useEffect sẽ xử lý lưu trữ và header)
            setUser(res.data.user);
            setToken(res.data.token);

            return res.data;
        } catch (err) {
            console.error("Lỗi đăng nhập:", err.response?.data || err.message);
            throw err;
        }
    };

    // 🚪 Đăng xuất
    const logout = async () => {
        try {
            // Gọi API logout (sử dụng axios mặc định có thể đã đính kèm token)
            await axios.post("http://localhost:4000/api/user/logout");
        } catch (err) {
            console.warn("Lỗi khi logout (có thể token hết hạn):", err.message);
        } finally {
            // Xóa trạng thái (useEffect sẽ xóa localStorage và header)
            setUser(null);
            setToken(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;