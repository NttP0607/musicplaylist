import { v2 as cloudinary } from 'cloudinary';
import songModel from '../models/songModel.js';
import artistModel from '../models/artistModel.js';
import albumModel from '../models/albumModel.js';

const addSong = async (req, res) => {
    try {
        // Lấy dữ liệu từ body và file
        const { name, desc, artistName, albumName, genre, mood, lyrics } = req.body;
        const imageFile = req.files?.image?.[0];
        const audioFile = req.files?.audio?.[0];

        // ⚠️ Kiểm tra dữ liệu bắt buộc
        if (!name || !artistName || !audioFile) {
            return res.status(400).json({ success: false, message: "Missing required fields: name, artistName, and audio file" });
        }

        // 🎤 Tìm hoặc tạo nghệ sĩ
        let artist = await artistModel.findOne({ name: artistName });
        if (!artist) {
            artist = new artistModel({ name: artistName });
            await artist.save();
        }

        // 💽 Tìm album nếu có (chỉ thêm vào album đã tồn tại)
        let album = null;
        if (albumName && albumName !== "none") {
            album = await albumModel.findOne({ name: albumName });
            // Cân nhắc: Bạn có thể trả về lỗi nếu albumName được cung cấp nhưng không tìm thấy
            if (!album) return res.status(404).json({ success: false, message: "Album not found" });
        }

        // 📤 Upload ảnh & file nhạc lên Cloudinary
        const imageUpload = imageFile
            ? await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            : null;

        const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
            resource_type: "video", // Dùng 'video' cho file âm thanh để lấy thời lượng
            folder: "songs",
        });

        // 🧮 Tính thời lượng (Cloudinary trả về theo giây)
        const duration = Math.round(audioUpload.duration);

        // 🆕 Tạo bài hát mới
        const newSong = new songModel({
            name,
            desc,
            artist: artist._id,
            album: album ? album._id : null,
            genre,
            mood,
            lyrics,
            image: imageUpload ? imageUpload.secure_url : "",
            file: audioUpload.secure_url,
            duration,
        });

        await newSong.save();

        // 🎵 Nếu có album thì thêm ID bài hát vào album đó
        if (album) {
            album.songs.push(newSong._id);
            await album.save();
        }

        res.json({
            success: true,
            message: "Song added successfully",
            song: newSong,
        });
    } catch (error) {
        console.error("Add song error:", error);
        res.status(500).json({ success: false, message: "Failed to add song" });
    }
};
// ✅ Sửa/Cập nhật bài hát
const updateSong = async (req, res) => {
    try {
        const { id, name, desc, artistName, albumName, genre, mood, lyrics } = req.body;
        const imageFile = req.files?.image?.[0];
        const audioFile = req.files?.audio?.[0];

        if (!id) {
            return res.status(400).json({ success: false, message: "Missing song ID" });
        }

        // 1. Tìm bài hát hiện tại
        const existingSong = await songModel.findById(id);
        if (!existingSong) {
            return res.status(404).json({ success: false, message: "Song not found" });
        }

        // 2. Xử lý Nghệ sĩ (Tìm hoặc tạo mới nếu tên nghệ sĩ thay đổi)
        let artistId = existingSong.artist;
        if (artistName) {
            let artist = await artistModel.findOne({ name: artistName });
            if (!artist) {
                artist = new artistModel({ name: artistName });
                await artist.save();
            }
            artistId = artist._id;
        }

        // 3. Xử lý Album (Gỡ khỏi album cũ và thêm vào album mới nếu thay đổi)
        let albumId = existingSong.album;
        if (albumName !== undefined) {
            const oldAlbumId = existingSong.album;
            let newAlbum = null;

            // Gỡ khỏi album cũ
            if (oldAlbumId) {
                await albumModel.findByIdAndUpdate(oldAlbumId, { $pull: { songs: id } });
            }

            // Thêm vào album mới (nếu tên album mới khác 'none')
            if (albumName && albumName !== "none") {
                newAlbum = await albumModel.findOne({ name: albumName });
                if (!newAlbum) {
                    // Nếu album mới không tồn tại, có thể coi là lỗi hoặc tạo mới tùy nghiệp vụ
                    return res.status(404).json({ success: false, message: "New album not found" });
                }
                newAlbum.songs.push(id);
                await newAlbum.save();
                albumId = newAlbum._id;
            } else {
                albumId = null; // Thiết lập là null nếu chuyển sang 'none'
            }
        }

        // 4. Xử lý Upload Ảnh/Audio lên Cloudinary
        let imageUpdate = {};
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            imageUpdate = { image: imageUpload.secure_url };
            // *Thêm logic xóa file ảnh cũ trên Cloudinary nếu bạn có lưu public_id*
        }

        let audioUpdate = {};
        let durationUpdate = {};
        if (audioFile) {
            const audioUpload = await cloudinary.uploader.upload(audioFile.path, { resource_type: "video", folder: "songs" });
            audioUpdate = { file: audioUpload.secure_url };
            durationUpdate = { duration: Math.round(audioUpload.duration) };
            // *Thêm logic xóa file audio cũ trên Cloudinary nếu bạn có lưu public_id*
        }

        // 5. Cập nhật bài hát trong DB
        const updatedData = {
            name: name || existingSong.name,
            desc: desc || existingSong.desc,
            genre: genre || existingSong.genre,
            mood: mood || existingSong.mood,
            lyrics: lyrics || existingSong.lyrics,
            artist: artistId,
            album: albumId,
            ...imageUpdate,
            ...audioUpdate,
            ...durationUpdate,
        };

        const updatedSong = await songModel.findByIdAndUpdate(id, updatedData, { new: true });

        res.json({
            success: true,
            message: "Song updated successfully",
            song: updatedSong,
        });

    } catch (error) {
        console.error("Update song error:", error);
        res.status(500).json({ success: false, message: "Failed to update song" });
    }
};
// ✅ Lấy danh sách tất cả bài hát
const listSong = async (req, res) => {
    try {
        const allSongs = await songModel.find({})
            .populate("album", "name")
            .populate("artist", "name");
        res.json({ success: true, songs: allSongs });
    } catch (error) {
        console.error("List song error:", error);
        res.status(500).json({ success: false, message: "Cannot list songs" });
    }
};

// ✅ Xóa bài hát (Đã cải tiến xử lý tính toàn vẹn album)
const removeSong = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ success: false, message: "Missing song ID" });

        // 1. Tìm và xóa bài hát. Dùng findByIdAndDelete để lấy lại đối tượng đã xóa.
        const songToDelete = await songModel.findByIdAndDelete(id);

        if (!songToDelete) {
            return res.status(404).json({ success: false, message: "Song not found" });
        }

        // 2. Xóa tham chiếu khỏi album (nếu bài hát thuộc về album nào đó)
        if (songToDelete.album) {
            // Sử dụng $pull để xóa ID bài hát ra khỏi mảng 'songs' của album
            await albumModel.findByIdAndUpdate(
                songToDelete.album,
                { $pull: { songs: songToDelete._id } },
            );
        }

        // 3. Xóa file trên Cloudinary (Tùy chọn)
        // **Lưu ý:** Để xóa file trên Cloudinary, bạn cần lưu trữ 'public_id' thay vì 'secure_url'.
        // Ví dụ: songModel.filePublicId và songModel.imagePublicId.

        res.json({ success: true, message: "Song removed successfully" });
    } catch (error) {
        console.error("Remove song error:", error);
        res.status(500).json({ success: false, message: "Remove failed" });
    }
};

// ✅ Tìm kiếm bài hát
const searchSong = async (req, res) => {
    try {
        const query = req.query.query;
        if (!query?.trim()) {
            return res.status(400).json({ success: false, message: "Missing search query" });
        }

        // Tạo Regex để tìm kiếm không phân biệt chữ hoa/chữ thường (flag "i")
        const regex = new RegExp(query, "i");

        // Tìm kiếm trong các trường tên, mô tả, thể loại, tâm trạng và lời bài hát
        const matchedSongs = await songModel.find({
            $or: [
                { name: regex },
                { desc: regex },
                { genre: regex },
                { mood: regex },
                { lyrics: regex }
            ]
        })
            .populate("artist", "name"); // Có thể populate thêm artist/album

        res.json({ success: true, songs: matchedSongs });
    } catch (error) {
        console.error("Search song error:", error);
        res.status(500).json({ success: false, message: "Search failed" });
    }
};

export { addSong, updateSong, listSong, removeSong, searchSong };