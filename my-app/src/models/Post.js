// models/Post.js
import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  content: String,
  authorId: String,
  parentId: String,
  threadId: String,
  createdAt: { type: Date, default: Date.now },
  likes: [String],
});

// Export the model if it exists, or create it
export default mongoose.models.Post || mongoose.model('Post', PostSchema);
