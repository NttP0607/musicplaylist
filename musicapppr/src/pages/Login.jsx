import React, { useState, useContext } from "react";
// Giả định bạn có toastify được cài đặt
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
    // Thêm navigate hook nếu bạn đang dùng react-router-dom
    // const navigate = useNavigate(); 

    // AuthContext.login và .register trả về phản hồi từ API
    const { login, register } = useContext(AuthContext);

    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false); // Thêm state cho nút submit

    // --- CẤU HÌNH ĐIỀU HƯỚNG ---
    // Giả định: Ứng dụng User chạy ở 3000, Admin Panel chạy ở 3001
    const ADMIN_URL = 'http://localhost:5174';
    const USER_URL = 'http://localhost:5173';

    // Hàm điều hướng và phân luồng
    const handleNavigation = (user) => {
        if (user.role === 'admin') {
            // Chuyển hướng cứng đến Admin Panel
            window.location.href = ADMIN_URL;
        } else {
            // Chuyển hướng đến trang chính của User App
            window.location.href = USER_URL;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let response;
            if (isRegister) {
                // 1. Đăng ký
                response = await register(username, email, password);
                toast.success(response.message || "Đăng ký thành công!");

                // Sau khi đăng ký, chuyển sang màn hình đăng nhập (không tự động login)
                setIsRegister(false);
                setUsername('');

            } else {
                // 2. Đăng nhập
                const loginResponse = await login(email, password);
                toast.success(loginResponse.message || "Đăng nhập thành công!");

                // ✅ PHÂN LUỒNG: Sử dụng thông tin user đã lưu trong Context
                handleNavigation(loginResponse.user);
            }
        } catch (err) {
            // Lấy thông báo lỗi chi tiết từ server (err.response.data.message)
            const errorMessage = err.response?.data?.message || "Sai thông tin hoặc lỗi server!";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-2xl shadow-xl w-80">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    {isRegister ? "Đăng ký" : "Đăng nhập"} 🔑
                </h2>

                {/* Tên người dùng */}
                {isRegister && (
                    <input
                        type="text"
                        placeholder="Tên người dùng"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
                        required={isRegister}
                    />
                )}

                {/* Email */}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
                    required
                />

                {/* Mật khẩu */}
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
                    required
                />

                {/* Nút Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 bg-green-600 hover:bg-green-500 rounded disabled:bg-gray-500"
                >
                    {isSubmitting ? "Đang xử lý..." : (isRegister ? "Đăng ký" : "Đăng nhập")}
                </button>

                {/* Toggle Register/Login */}
                <p className="text-sm mt-4 text-center">
                    {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
                    <span
                        onClick={() => {
                            setIsRegister(!isRegister);
                            // Xóa form khi chuyển chế độ
                            setEmail('');
                            setPassword('');
                            setUsername('');
                        }}
                        className="text-blue-400 cursor-pointer hover:underline"
                    >
                        {isRegister ? "Đăng nhập" : "Đăng ký"}
                    </span>
                </p>
            </form>
        </div>
    );
};

export default Login;