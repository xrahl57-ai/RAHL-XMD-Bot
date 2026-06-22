import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  jid: { type: String, required: true, unique: true },
  name: { type: String, default: 'Unknown' },
  number: { type: String },
  banned: { type: Boolean, default: false },
  banReason: { type: String, default: '' },
  commandCount: { type: Number, default: 0 },
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  language: { type: String, default: 'en' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
