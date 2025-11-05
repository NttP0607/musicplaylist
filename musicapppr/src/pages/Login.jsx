import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
    const { login, register } = useContext(AuthContext);
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isRegister) {
                await register(username, email, password);
                alert("Đăng ký thành công!");
            } else {
                await login(email, password);
                alert("Đăng nhập thành công!");
            }
        } catch (err) {
            alert("Sai thông tin hoặc lỗi server!");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-2xl shadow-xl w-80">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    {isRegister ? "Đăng ký" : "Đăng nhập"}
                </h2>

                {isRegister && (
                    <input
                        type="text"
                        placeholder="Tên người dùng"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
                    />
                )}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
                />

                <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
                />

                <button type="submit" className="w-full py-2 bg-green-600 hover:bg-green-500 rounded">
                    {isRegister ? "Đăng ký" : "Đăng nhập"}
                </button>

                <p className="text-sm mt-4 text-center">
                    {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
                    <span
                        onClick={() => setIsRegister(!isRegister)}
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
