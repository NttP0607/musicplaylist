import React, { useContext } from "react";
// ⬅️ THÊM IMPORTS ROUTING
import { Routes, Route } from "react-router-dom";
// ⬅️ THÊM COMPONENT MỚI
import EmotionAnalyzer from "./pages/EmotionAnalyzer";

import Sidebar from "./components/Sidebar";
import Player from "./components/Player";
import Display from "./components/Display"; // Giữ lại nếu Display là trang Home/Playlist
import FullScreenPlayer from "./pages/FullScreenPlayer";
import { PlayerContext } from "./context/PlayerContext";
import { AuthContext } from "./context/AuthContext";
import Login from "./pages/Login";

const App = () => {
  const { songsData, playerView } = useContext(PlayerContext);
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Login />;
  }

  if (songsData.length === 0) {
    return <div className='h-screen bg-black text-white p-4'>Đang tải dữ liệu hoặc chưa có bài hát nào...</div>;
  }

  const isFullScreen = playerView === 'full';
  const mainContentHeightClass = isFullScreen ? 'h-full' : 'h-[90%]';

  // 🌟 Component chứa tất cả các trang chính (Routes)
  const MainAppRoutes = () => (
    <Routes>
      {/* ROUTE 1: Trang Home/Mặc định. Giả sử component Display là trang chính của bạn */}
      <Route path="/" element={<Display />} />

      {/* ROUTE 2: TRANG GỢI Ý CẢM XÚC AI */}
      <Route path="/suggest/emotion" element={<EmotionAnalyzer />} />

      {/* ROUTE 3: Thêm các route khác (ví dụ: Tìm kiếm) */}
      <Route path="/search" element={<div>Tìm kiếm</div>} />

      {/* Thêm các route khác của ứng dụng nếu cần */}

    </Routes>
  );


  return (
    <div className='h-screen bg-black'>

      <div className={mainContentHeightClass + " flex"}>
        <Sidebar />

        <div className="flex-1 overflow-y-auto">

          {/* ⬅️ THAY THẾ CHỖ NÀY BẰNG ROUTES */}
          {playerView === 'mini' && <MainAppRoutes />}

          {isFullScreen && <FullScreenPlayer />}
        </div>
      </div>

      {!isFullScreen && <Player />}
    </div>
  );
};

export default App;