import { logger } from '../utils/logger.js';

export async function handleCall(sock, call) {
  try {
    if (call.status === 'offer') {
      await sock.rejectCall(call.id, call.from);
      logger.info(`Rejected call from ${call.from}`);

      await sock.sendMessage(call.from, {
        text: '📵 Sorry, I cannot receive calls. Please send a message instead.\n\n👑 Powered By LORD RAHL',
      });
    }
  } catch (err) {
    logger.error('Call handler error:', err.message);
  }
}
