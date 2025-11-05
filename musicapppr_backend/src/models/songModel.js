import mongoose from "mongoose";
const { Schema } = mongoose;

const songSchema = new Schema({
    name: { type: String, required: true },
    desc: { type: String },
    album: { type: Schema.Types.ObjectId, ref: "Album" },
    artist: { type: Schema.Types.ObjectId, ref: "Artist" },
    genres: [{ type: Schema.Types.ObjectId, ref: "Genre" }], // nhiều thể loại
    moods: [{ type: Schema.Types.ObjectId, ref: "Mood" }],
    lyrics: { type: String },
    image: { type: String, required: true },
    file: { type: String, required: true }, // link nhạc
    duration: { type: Number, required: true }, // giây
    playCount: { type: Number, default: 0 },
}, { timestamps: true });

songSchema.index({ mood: 1, genre: 1 });

export default mongoose.models.Song || mongoose.model("Song", songSchema);