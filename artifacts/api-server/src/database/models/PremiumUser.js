import mongoose from 'mongoose';

const premiumSchema = new mongoose.Schema({
  jid: { type: String, required: true, unique: true },
  name: { type: String, default: 'Unknown' },
  addedBy: { type: String, default: '' },
  addedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null },
  active: { type: Boolean, default: true },
}, { timestamps: true });

premiumSchema.methods.isExpired = function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

const PremiumUser = mongoose.model('PremiumUser', premiumSchema);
export default PremiumUser;
