import React from "react";
import { assets } from '../assets/assets';
import "tailwindcss"
import { NavLink } from "react-router-dom";

const Sidebar = () => {
    return (
        <div className="bg-[#eaf1ec] min-h-screen w-[250px]">
            <img src={assets.logo} className="mt-5 w-[max(10vw, 100px)] hidden sm:block" alt="" />
            <img src={assets.logo_small} className="mt-5 w-[max(5vw, 40px)] mr-5 sm:hidden block" alt="" />
            <div className="flex flex-col gap-5 mt-10">
                <NavLink to='/add-song' className="flex items-center gap-2.5 pl-5 sm:pl-10 cursor-pointer hover:bg-[#d4e4d7] py-2">
                    <img src={assets.add_song} className="w-[20px] sm:w-[25px]" alt="" />
                    <p className="hidden sm:block">Add Song</p>
                </NavLink>
                <NavLink to='/list-song' className="flex items-center gap-2.5 pl-5 sm:pl-10 cursor-pointer hover:bg-[#d4e4d7] py-2">
                    <img src={assets.song_icon} className="w-[20px] sm:w-[25px]" alt="" />
                    <p className="hidden sm:block">List Song</p>
                </NavLink>
                <NavLink to='/add-album' className="flex items-center gap-2.5 pl-5 sm:pl-10 cursor-pointer hover:bg-[#d4e4d7] py-2">
                    <img src={assets.add_album} className="w-[20px] sm:w-[25px]" alt="" />
                    <p className="hidden sm:block">Add Album</p>
                </NavLink>
                <NavLink to='/list-album' className="flex items-center gap-2.5 pl-5 sm:pl-10 cursor-pointer hover:bg-[#d4e4d7] py-2">
                    <img src={assets.album_icon} className="w-[20px] sm:w-[25px]" alt="" />
                    <p className="hidden sm:block">List Album</p>
                </NavLink>

            </div>
        </div>
    );
};

export default Sidebar;
