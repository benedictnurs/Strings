// src/models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  authorId: { type: String, required: true, unique: true, index: true },
  username: { type: String },
  fullName: { type: String },
  profilePicture: { type: String },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
