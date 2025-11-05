import { useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const CLOUD_NAME = "your_cloud_name"; // ⚙️ Thay bằng tên cloud của bạn
const UPLOAD_PRESET = "your_upload_preset"; // ⚙️ Thay bằng upload preset của bạn

const Profile = () => {
    const { user, setUser, token } = useContext(AuthContext);
    const [username, setUsername] = useState(user?.username || "");
    const [avatar, setAvatar] = useState(user?.avatar || "");
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");

    // 🖼️ Upload ảnh lên Cloudinary
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            setAvatar(data.secure_url);
            setMessage("Tải ảnh lên thành công ✅");
        } catch (error) {
            console.error("Lỗi upload ảnh:", error);
            setMessage("Lỗi tải ảnh ❌");
        } finally {
            setUploading(false);
        }
    };

    // 💾 Gửi cập nhật đến backend
    const handleUpdate = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await axios.put(
                `http://localhost:4000/api/users/${user.id}`,
                { username, avatar },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setUser(res.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            setMessage("Cập nhật thành công ✅");
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            setMessage("Cập nhật thất bại ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center mt-10 text-white">
            <h1 className="text-2xl font-bold mb-6">Hồ sơ cá nhân</h1>

            <div className="bg-zinc-900 p-6 rounded-2xl w-[400px] shadow-lg">
                {/* Avatar */}
                <div className="flex flex-col items-center mb-4">
                    <img
                        src={avatar || "https://via.placeholder.com/100"}
                        alt="avatar"
                        className="w-24 h-24 rounded-full object-cover mb-3 border-2 border-pink-500"
                    />
                    <label className="bg-pink-600 hover:bg-pink-700 px-3 py-1 rounded-md text-sm cursor-pointer">
                        {uploading ? "Đang tải..." : "Chọn ảnh mới"}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </label>
                </div>

                {/* Username */}
                <label className="text-sm text-gray-400">Tên người dùng</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-zinc-800 p-2 rounded-md w-full mb-4 outline-none"
                />

                {/* Email (readonly) */}
                <label className="text-sm text-gray-400">Email</label>
                <input
                    type="text"
                    value={user?.email}
                    readOnly
                    className="bg-zinc-800 p-2 rounded-md w-full mb-4 outline-none text-gray-400"
                />

                {/* Save button */}
                <button
                    onClick={handleUpdate}
                    disabled={loading || uploading}
                    className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg w-full transition"
                >
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>

                {message && (
                    <p
                        className={`text-center text-sm mt-3 ${message.includes("✅") ? "text-green-400" : "text-red-400"
                            }`}
                    >
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Profile;
