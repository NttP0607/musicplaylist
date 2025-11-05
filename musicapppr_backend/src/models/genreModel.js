import mongoose from "mongoose";
const { Schema } = mongoose;

const genreSchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    parentGenre: { type: Schema.Types.ObjectId, ref: "Genre" }, // nếu có thể loại con
}, { timestamps: true });

export default mongoose.models.Genre || mongoose.model("Genre", genreSchema);
