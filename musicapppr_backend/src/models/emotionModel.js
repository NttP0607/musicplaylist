import mongoose from "mongoose";
const { Schema } = mongoose;

const emotionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["face", "voice", "text"], required: true },
    emotion: { type: String, required: true }, // happy, sad, angry,...
    confidence: { type: Number, default: 1.0 },
    context: { type: String }, // mô tả ngữ cảnh (nếu có)
    detectedAt: { type: Date, default: Date.now }
});

emotionSchema.index({ user: 1, detectedAt: -1 });

export default mongoose.models.Emotion || mongoose.model("Emotion", emotionSchema);
