import mongoose from 'mongoose';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';

const sessionSchema = new mongoose.Schema(
  {
    botId: { type: String, required: true, unique: true, index: true },
    files: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

let SessionModel;
function getModel() {
  if (!SessionModel) {
    SessionModel = mongoose.models.BotSession || mongoose.model('BotSession', sessionSchema);
  }
  return SessionModel;
}

export async function saveSessionToMongo(sessionDir, botId = 'rahl-xmd') {
  try {
    if (!existsSync(sessionDir)) return false;
    const files = {};
    for (const name of readdirSync(sessionDir)) {
      try {
        files[name] = JSON.parse(readFileSync(join(sessionDir, name), 'utf-8'));
      } catch {
        // skip non-JSON files
      }
    }
    if (Object.keys(files).length === 0) return false;

    const Model = getModel();
    await Model.findOneAndUpdate(
      { botId },
      { botId, files },
      { upsert: true, new: true },
    );
    logger.info(`Session saved to MongoDB (${Object.keys(files).length} files, botId: ${botId})`);
    return true;
  } catch (err) {
    logger.error('saveSessionToMongo failed:', err.message);
    return false;
  }
}

export async function loadSessionFromMongo(sessionDir, botId = 'rahl-xmd') {
  try {
    const Model = getModel();
    const doc = await Model.findOne({ botId });
    if (!doc || !doc.files || Object.keys(doc.files).length === 0) {
      logger.info('No session found in MongoDB for botId: ' + botId);
      return false;
    }

    mkdirSync(sessionDir, { recursive: true });
    for (const [name, data] of Object.entries(doc.files)) {
      writeFileSync(join(sessionDir, name), JSON.stringify(data, null, 2));
    }
    logger.info(`Session loaded from MongoDB (${Object.keys(doc.files).length} files restored)`);
    console.log('\x1b[35m✓ Session loaded from MongoDB (' + Object.keys(doc.files).length + ' files)\x1b[0m');
    return true;
  } catch (err) {
    logger.error('loadSessionFromMongo failed:', err.message);
    return false;
  }
}

export async function hasSessionInMongo(botId = 'rahl-xmd') {
  try {
    const Model = getModel();
    const doc = await Model.findOne({ botId }, { _id: 1 });
    return !!doc;
  } catch {
    return false;
  }
}
