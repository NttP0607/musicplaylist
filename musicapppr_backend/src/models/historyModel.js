import mongoose from "mongoose";
const { Schema } = mongoose;

const listeningHistorySchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" },
    song: { type: Schema.Types.ObjectId, ref: "Song" },
    playedAt: { type: Date, default: Date.now },
    durationPlayed: { type: Number, default: 0 } // số giây người dùng nghe thực tế
});

listeningHistorySchema.index({ user: 1, playedAt: -1 });

export default mongoose.models.ListeningHistory || mongoose.model("ListeningHistory", listeningHistorySchema);
