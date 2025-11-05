import mongoose from "mongoose";
const { Schema } = mongoose;

const playlistSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    songs: [{ type: Schema.Types.ObjectId, ref: "Song" }],
    isPublic: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Playlist || mongoose.model("Playlist", playlistSchema);
