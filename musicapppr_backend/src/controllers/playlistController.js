import playlistModel from "../models/playlistModel.js";

export const addPlaylist = async (req, res) => {
    const playlist = await playlistModel.create(req.body);
    res.json({ success: true, playlist });
};

export const listPlaylists = async (_, res) => {
    const playlists = await playlistModel.find({})
        .populate("user", "username")
        .populate("songs", "name");
    res.json({ success: true, playlists });
};

export const updatePlaylist = async (req, res) => {
    const playlist = await playlistModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, playlist });
};

export const deletePlaylist = async (req, res) => {
    await playlistModel.findByIdAndDelete(req.params.id);
    res.json({ success: true });
};
