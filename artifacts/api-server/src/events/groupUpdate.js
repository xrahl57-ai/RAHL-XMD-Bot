import Group from '../database/models/Group.js';
import { logger } from '../utils/logger.js';

export async function handleGroupUpdate(sock, update) {
  try {
    const { id, subject, desc, restrict, announce } = update;
    if (!id) return;

    await Group.findOneAndUpdate(
      { jid: id },
      {
        $set: {
          name: subject || undefined,
          lastActivity: new Date(),
        },
      },
      { upsert: true },
    );

    logger.info(`Group updated: ${id}`);
  } catch (err) {
    logger.error('Group update handler error:', err.message);
  }
}
