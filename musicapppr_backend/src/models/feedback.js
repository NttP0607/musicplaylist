const feedbackSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    song: { type: Schema.Types.ObjectId, ref: 'Song' },
    type: { type: String, enum: ['like', 'dislike', 'skip', 'save'] },
    createdAt: { type: Date, default: Date.now }
});
