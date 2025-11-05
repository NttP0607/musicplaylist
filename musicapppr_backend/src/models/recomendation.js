import mongoose from "mongoose";
const { Schema } = mongoose;

const recommendationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    emotion: { type: String },
    emotionRef: { type: Schema.Types.ObjectId, ref: "Emotion" },
    songs: [{ type: Schema.Types.ObjectId, ref: "Song" }],
    generatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Recommendation || mongoose.model("Recommendation", recommendationSchema);
