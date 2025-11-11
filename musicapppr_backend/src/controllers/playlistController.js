import playlistModel from '../models/playlistModel.js';
import songModel from '../models/songModel.js'; // Cần thiết cho các thao tác bài hát
import mongoose from 'mongoose';

// Giả định: req.user có thể tồn tại (chứa _id) nhưng không được dùng để kiểm tra quyền sở hữu.

/**
 * 🟢 Tạo Playlist mới
 * Quy tắc: Luôn FORCE isPublic = true.
 */
const addPlaylist = async (req, res) => {
    try {
        const { name, songs = [] } = req.body;
        const userId = req.user?._id;

        if (!userId || !name) {
            return res.status(400).json({ success: false, message: "Tên và User ID là bắt buộc" });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "User ID không hợp lệ" });
        }

        const newPlaylist = new playlistModel({
            user: userId,
            name: name.trim(),
            songs: songs,
            isPublic: true, // 🚨 FORCE: Luôn là PUBLIC
        });

        await newPlaylist.save();
        res.status(201).json({ success: true, message: "Playlist đã được tạo công khai", playlist: newPlaylist });

    } catch (error) {
        console.error("Add playlist error:", error);
        res.status(500).json({ success: false, message: "Failed to create playlist" });
    }
};

/**
 * 🔵 Lấy danh sách Playlists
 * Quy tắc: CHỈ được thấy các playlist Public.
 */
const listPlaylists = async (req, res) => {
    try {
        // 🚨 Lọc cứng: Chỉ tìm kiếm các playlist công khai
        const playlists = await playlistModel.find({ isPublic: true })
            .populate("user", "username")
            .populate("songs", "name artist image duration");

        res.json({ success: true, playlists });
    } catch (error) {
        console.error("List playlists error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch playlists" });
    }
};

/**
 * 🟣 Lấy chi tiết Playlist theo ID
 * Quy tắc: Nếu tìm thấy, PHẢI là Public.
 */
const getPlaylistById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Playlist ID không hợp lệ" });
        }

        // Lấy playlist VÀ kiểm tra điều kiện isPublic: true
        const playlist = await playlistModel.findOne({ _id: id, isPublic: true })
            .populate("user", "username")
            .populate("songs", "name artist image duration");

        if (!playlist) {
            // Trả về 404 nếu không tìm thấy HOẶC nếu nó là Private
            return res.status(404).json({ success: false, message: "Playlist không tìm thấy (hoặc là riêng tư)" });
        }

        res.json({ success: true, playlist });
    } catch (error) {
        console.error("Get playlist error:", error);
        res.status(500).json({ success: false, message: "Error fetching playlist" });
    }
};

/**
 * 🟠 Cập nhật Playlist (Không kiểm tra quyền sở hữu, chỉ kiểm tra Public)
 */
const updatePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, isPublic } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Playlist ID không hợp lệ" });
        }

        // Kiểm tra xem playlist có tồn tại VÀ là public không
        const playlist = await playlistModel.findOne({ _id: id, isPublic: true });
        if (!playlist) return res.status(404).json({ success: false, message: "Playlist không tìm thấy (hoặc là riêng tư)" });

        if (name) playlist.name = name.trim();
        // 🚨 FORCE: Bỏ qua input isPublic từ body và đặt lại là true
        playlist.isPublic = true;

        await playlist.save();
        res.json({ success: true, message: "Cập nhật playlist thành công", playlist });

    } catch (error) {
        console.error("Update playlist error:", error);
        res.status(500).json({ success: false, message: "Failed to update playlist" });
    }
};

/**
 * 🔴 Xóa Playlist (Không kiểm tra quyền sở hữu, chỉ kiểm tra Public)
 */
const removePlaylist = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) return res.status(400).json({ success: false, message: "Thiếu Playlist ID" });
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Playlist ID không hợp lệ" });
        }

        // Tìm và xóa playlist thỏa mãn điều kiện isPublic: true
        const deleted = await playlistModel.findOneAndDelete({ _id: id, isPublic: true });
        if (!deleted) return res.status(404).json({ success: false, message: "Playlist không tìm thấy (hoặc là riêng tư)" });

        res.json({ success: true, message: "Playlist đã được xóa" });
    } catch (error) {
        console.error("Remove playlist error:", error);
        res.status(500).json({ success: false, message: "Failed to delete playlist" });
    }
};

/**
 * ➕ Thêm Bài hát vào Playlist (Không kiểm tra quyền sở hữu, chỉ kiểm tra Public)
 */
const addSongToPlaylist = async (req, res) => {
    try {
        const { playlistId, songId } = req.body;

        if (!playlistId || !songId) {
            return res.status(400).json({ success: false, message: "Thiếu ID Playlist hoặc Song" });
        }
        if (!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(songId)) {
            return res.status(400).json({ success: false, message: "ID bài hát/playlist không hợp lệ" });
        }

        // Kiểm tra playlist có tồn tại và là public
        const playlist = await playlistModel.findOne({ _id: playlistId, isPublic: true });
        if (!playlist) return res.status(404).json({ success: false, message: "Playlist không tìm thấy (hoặc là riêng tư)" });

        const updatedPlaylist = await playlistModel.findByIdAndUpdate(
            playlistId,
            { $addToSet: { songs: songId } },
            { new: true }
        ).populate("songs", "name duration image artist");


        res.json({ success: true, message: "Bài hát đã được thêm vào playlist", playlist: updatedPlaylist });

    } catch (error) {
        console.error("Add song to playlist error:", error);
        res.status(500).json({ success: false, message: "Failed to add song to playlist" });
    }
};

/**
 * ➖ Gỡ Bài hát khỏi Playlist (Không kiểm tra quyền sở hữu, chỉ kiểm tra Public)
 */
const removeSongFromPlaylist = async (req, res) => {
    try {
        const { playlistId, songId } = req.body;

        if (!playlistId || !songId) {
            return res.status(400).json({ success: false, message: "Thiếu ID Playlist hoặc Song" });
        }
        if (!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(songId)) {
            return res.status(400).json({ success: false, message: "ID bài hát/playlist không hợp lệ" });
        }

        // Kiểm tra playlist có tồn tại và là public
        const playlist = await playlistModel.findOne({ _id: playlistId, isPublic: true });
        if (!playlist) return res.status(404).json({ success: false, message: "Playlist không tìm thấy (hoặc là riêng tư)" });

        const updatedPlaylist = await playlistModel.findByIdAndUpdate(
            playlistId,
            { $pull: { songs: songId } },
            { new: true }
        ).populate("songs", "name duration image artist");

        res.json({ success: true, message: "Bài hát đã được gỡ khỏi playlist", playlist: updatedPlaylist });

    } catch (error) {
        console.error("Remove song from playlist error:", error);
        res.status(500).json({ success: false, message: "Failed to remove song from playlist" });
    }
};


export {
    addPlaylist,
    listPlaylists,
    getPlaylistById,
    updatePlaylist,
    removePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist
};