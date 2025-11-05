import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import UserMenu from "./UserMenu";

const Navbar = () => {
    const navigate = useNavigate()
    return (
        <>
            <div className="w-full flex justify-between items-center font-semibold">
                <div className="flex items-center gap-2">
                    <img onClick={() => navigate(-1)} className="w-8 bg-black p-2 rounded-2xl cursor-pointer" src={assets.arrow_left} alt="" />
                    <img onClick={() => navigate(1)} className="w-8 bg-black p-2 rounded-2xl cursor-pointer" src={assets.arrow_right} alt="" />
                </div>
                <div className="flex items-center gap-4">
                    <p className="bg-white text-black text-[15px] px-4 py-1 rounded-2xl hidden md:block cursor-pointer">Gói Premium</p>
                    <p className="bg-black py-1 px-3 rounded-2xl text-[15px]">App</p>
                    <UserMenu />
                </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
                <p className="bg-white text-black px-4 py-1 rounded-2xl cursor-pointer">Tất cả</p>
                <p className="bg-black px-4 py-1 rounded-2xl">Âm nhạc</p>
                <p className="bg-black px-4 py-1 rounded-2xl">Podcasts</p>

            </div>
        </>
    )
}

export default Navbar