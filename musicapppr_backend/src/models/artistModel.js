import mongoose from "mongoose";
const { Schema } = mongoose;

const artistSchema = new Schema({
    name: { type: String, required: true },
    bio: { type: String },
    image: { type: String },
}, { timestamps: true });

export default mongoose.models.Artist || mongoose.model("Artist", artistSchema);
