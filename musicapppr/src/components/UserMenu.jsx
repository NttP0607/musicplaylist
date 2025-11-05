import { useContext, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User as UserIcon, Settings } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const UserMenu = () => {
    const { user, logout } = useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const menuRef = useRef();

    // Đóng menu khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const avatarLetter = user?.username?.charAt(0).toUpperCase() || "U";

    return (
        <div className="relative" ref={menuRef}>
            {/* Avatar / chữ cái đầu */}
            {user?.avatar ? (
                <img
                    src={user.avatar}
                    alt="avatar"
                    onClick={() => setOpen(!open)}
                    className="w-9 h-9 rounded-full cursor-pointer object-cover border-2 border-pink-500 hover:opacity-80 transition"
                />
            ) : (
                <div
                    onClick={() => setOpen(!open)}
                    className="bg-pink-600 text-black w-9 h-9 rounded-full flex items-center justify-center cursor-pointer select-none font-semibold hover:scale-105 transition"
                >
                    {avatarLetter}
                </div>
            )}

            {/* Khung menu */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-56 bg-zinc-900 text-white rounded-xl shadow-lg border border-zinc-800 p-3 z-50"
                    >
                        <div className="flex items-center gap-3 px-2 py-1">
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt="avatar"
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="bg-pink-600 text-black w-10 h-10 rounded-full flex items-center justify-center font-semibold">
                                    {avatarLetter}
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-sm">{user?.username}</p>
                                <p className="text-xs text-gray-400">{user?.email}</p>
                            </div>
                        </div>

                        <hr className="border-zinc-700 my-2" />

                        <div className="flex flex-col text-sm">
                            <button
                                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-zinc-800 transition"
                                onClick={() => {
                                    setOpen(false);
                                    // bạn có thể thêm route đến trang cá nhân ở đây
                                }}
                            >
                                <UserIcon size={16} />
                                <span>Trang cá nhân</span>
                            </button>

                            <button
                                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-zinc-800 transition"
                                onClick={() => {
                                    setOpen(false);
                                    // route đến cài đặt nếu có
                                }}
                            >
                                <Settings size={16} />
                                <span>Cài đặt</span>
                            </button>

                            <button
                                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-600/30 text-red-400 mt-1 transition"
                                onClick={() => {
                                    logout();
                                    setOpen(false);
                                }}
                            >
                                <LogOut size={16} />
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserMenu;
