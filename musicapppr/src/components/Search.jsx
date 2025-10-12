import React, { useState, useEffect } from "react";
import axios from "axios";

const Search = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    const handleSearch = async () => {
        if (!query.trim()) return;
        try {
            const res = await axios.get(`http://localhost:4000/api/search?query=${query}`);
            setResults(res.data);
        } catch (error) {
            console.error("Lỗi khi tìm kiếm:", error);
        }
    };

    return (
        <div className="flex flex-col w-full h-full p-6 text-white">
            <h1 className="text-2xl font-bold mb-4">Tìm kiếm bài hát</h1>

            <div className="flex gap-3 mb-6">
                <input
                    type="text"
                    placeholder="Nhập tên bài hát hoặc nghệ sĩ..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 p-2 rounded bg-[#1E1E1E] text-white outline-none"
                />
                <button
                    onClick={handleSearch}
                    className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-black font-semibold"
                >
                    Tìm
                </button>
            </div>

            <div className="flex flex-col gap-3">
                {results.length > 0 ? (
                    results.map((song) => (
                        <div
                            key={song._id}
                            className="bg-[#121212] p-4 rounded flex items-center justify-between hover:bg-[#242424] transition"
                        >
                            <div>
                                <p className="font-semibold">{song.name}</p>
                                <p className="text-gray-400 text-sm">{song.artist}</p>
                            </div>
                            <button className="text-sm text-green-400">Phát</button>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400">Không có kết quả</p>
                )}
            </div>
        </div>
    );
};

export default Search;
