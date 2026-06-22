import mongoose from 'mongoose';

const statisticsSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  commandsRun: { type: Number, default: 0 },
  messagesReceived: { type: Number, default: 0 },
  errorCount: { type: Number, default: 0 },
  newUsers: { type: Number, default: 0 },
  newGroups: { type: Number, default: 0 },
}, { timestamps: true });

const Statistics = mongoose.model('Statistics', statisticsSchema);
export default Statistics;
