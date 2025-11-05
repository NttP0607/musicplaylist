// src/context/AuthContext.jsx
import { createContext, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);

    // Tạo instance axios để gọi API
    const API = axios.create({
        baseURL: "http://localhost:4000/api/user",
    });

    // Đăng ký người dùng
    const register = async (username, email, password) => {
        try {
            const res = await API.post("/register", { username, email, password });
            setUser(res.data.user);
            setToken(res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            localStorage.setItem("token", res.data.token);
            return res.data;
        } catch (err) {
            console.error("Lỗi đăng ký:", err.response?.data || err.message);
            throw err;
        }
    };

    // Đăng nhập
    const login = async (email, password) => {
        try {
            const res = await API.post("/login", { email, password });
            setUser(res.data.user);
            setToken(res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            localStorage.setItem("token", res.data.token);
            return res.data;
        } catch (err) {
            console.error("Lỗi đăng nhập:", err.response?.data || err.message);
            throw err;
        }
    };

    // Đăng xuất
    const logout = async () => {
        try {
            await API.post("/logout");
        } catch (err) {
            console.warn("Lỗi khi logout:", err.message);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
