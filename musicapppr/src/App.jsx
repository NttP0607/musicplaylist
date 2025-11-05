import React, { useContext } from "react";
import Sidebar from "./components/Sidebar";
import Player from "./components/Player";
import Display from "./components/Display";
import FullScreenPlayer from "./pages/FullScreenPlayer";
// import Navbar from "./components/Navbar"; // <-- Giả định Navbar được sử dụng ở đây nếu bạn muốn nó luôn hiển thị
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

  return (
    <div className='h-screen bg-black'>

      {/* 1. KHU VỰC NỘI DUNG CHÍNH (90% chiều cao) */}
      <div className="h-[90%] flex">

        {/* 1A. SIDEBAR: LUÔN HIỂN THỊ */}
        <Sidebar />

        {/* 1B. KHU VỰC HIỂN THỊ NỘI DUNG/PLAYER (flex-1) */}
        <div className="flex-1 overflow-y-auto">

          {/* LƯU Ý: Nếu Navbar được nhúng trong DisplayHome, nó sẽ bị ẩn khi FullScreenPlayer được gọi */}

          {/* 🔄 HIỂN THỊ FULL SCREEN PLAYER KHI ZOOM */}
          {/* Component này phải được thiết kế để không chứa Navbar/Sidebar */}
          {playerView === 'full' && <FullScreenPlayer />}

          {/* 🏡 HIỂN THỊ GIAO DIỆN CŨ (DISPLAY) KHI KHÔNG ZOOM */}
          {playerView === 'mini' && <Display />}
        </div>
      </div>

      {/* 2. KHU VỰC PLAYER BAR (LUÔN HIỂN THỊ) */}
      <Player />
    </div>
  );
};

export default App;