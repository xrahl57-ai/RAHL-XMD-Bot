/**
 * Chat Settings — per-chat feature toggles (antidelete, etc.)
 *
 * In-memory Map for speed. Persists to MongoDB for groups (via Group model).
 * Private chats: in-memory only (resets on restart — acceptable behaviour).
 */

import Group from '../database/models/Group.js';
import { logger } from '../utils/logger.js';

const settingsCache = new Map();

export async function getAntiDelete(jid) {
  if (settingsCache.has(jid)) return settingsCache.get(jid);
  if (jid.endsWith('@g.us')) {
    try {
      const doc = await Group.findOne({ jid }).lean();
      const val = doc?.antidelete ?? false;
      settingsCache.set(jid, val);
      return val;
    } catch { return false; }
  }
  return false;
}

export async function setAntiDelete(jid, enabled) {
  settingsCache.set(jid, enabled);
  if (jid.endsWith('@g.us')) {
    try {
      await Group.findOneAndUpdate(
        { jid },
        { antidelete: enabled },
        { upsert: true, new: true },
      );
    } catch (err) {
      logger.warn('chatSettings: MongoDB write failed —', err.message);
    }
  }
}
