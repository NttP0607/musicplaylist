import express from "express";
import { addPlaylist, listPlaylists, updatePlaylist, deletePlaylist } from "../controllers/playlistController.js";
const router = express.Router();

router.post("/add", addPlaylist);
router.get("/list", listPlaylists);
router.put("/:id", updatePlaylist);
router.delete("/:id", deletePlaylist);

export default router;
