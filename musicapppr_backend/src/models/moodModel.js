import mongoose from "mongoose";
const { Schema } = mongoose;

const moodSchema = new Schema({
    name: { type: String, required: true, unique: true },
    color: { type: String },
    icon: { type: String },
    description: { type: String },
}, { timestamps: true });

export default mongoose.models.Mood || mongoose.model("Mood", moodSchema);
