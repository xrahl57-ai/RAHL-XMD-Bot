import mongoose from 'mongoose';

const warningSchema = new mongoose.Schema({
  jid: { type: String, required: true },
  groupJid: { type: String, required: true },
  count: { type: Number, default: 0 },
  reasons: [{ type: String }],
  warnedBy: { type: String, default: '' },
  lastWarn: { type: Date, default: Date.now },
}, { timestamps: true });

warningSchema.index({ jid: 1, groupJid: 1 }, { unique: true });

const Warning = mongoose.model('Warning', warningSchema);
export default Warning;
