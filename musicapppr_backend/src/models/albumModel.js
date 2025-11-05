import mongoose from "mongoose";
const { Schema } = mongoose;

const albumSchema = new Schema({
    name: { type: String, required: true },
    desc: { type: String },
    artist: { type: Schema.Types.ObjectId, ref: "Artist", required: true },
    songs: [{ type: Schema.Types.ObjectId, ref: "Song" }],
    bgColor: { type: String },
    image: { type: String },
    releaseDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Album || mongoose.model("Album", albumSchema);
