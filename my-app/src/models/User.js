import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  authorId: { type: String, required: true, unique: true },
  username: { type: String },
  fullName: { type: String },
  profilePicture: { type: String },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
