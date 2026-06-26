import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  jid: { type: String, required: true, unique: true },
  name: { type: String, default: 'Unknown Group' },
  welcome: { type: Boolean, default: false },
  welcomeMessage: { type: String, default: '' },
  antilink: { type: Boolean, default: false },
  antibot: { type: Boolean, default: false },
  antispam: { type: Boolean, default: false },
  muted: { type: Boolean, default: false },
  antidelete: { type: Boolean, default: false },
  botAdmin: { type: Boolean, default: false },
  firstSeen: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
}, { timestamps: true });

const Group = mongoose.model('Group', groupSchema);
export default Group;
