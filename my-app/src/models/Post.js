// models/Post.js

import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  content: { type: String, required: true },
  authorId: { type: String, required: true }, // Store Clerk user ID as a string
  parentId: { type: String, default: null },
  threadId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: String }], // List of user IDs who liked the post
});

export default mongoose.models.Post || mongoose.model('Post', PostSchema);
