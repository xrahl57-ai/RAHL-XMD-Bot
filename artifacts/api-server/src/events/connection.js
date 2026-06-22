import { DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { logger } from '../utils/logger.js';

export async function handleConnection(sock, update, onDisconnect) {
  const { connection, lastDisconnect, qr } = update;

  if (qr) {
    logger.warn('QR code generated — SESSION_ID may be invalid or expired.');
  }

  if (connection === 'close') {
    const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
    const shouldReconnect = reason !== DisconnectReason.loggedOut;

    logger.warn(`Connection closed. Reason: ${reason}. Reconnect: ${shouldReconnect}`);

    if (reason === DisconnectReason.loggedOut) {
      logger.error('Session logged out. Please regenerate your SESSION_ID.');
      return;
    }

    if (reason === DisconnectReason.badSession) {
      logger.error('Bad session. Please regenerate your SESSION_ID.');
      return;
    }

    if (shouldReconnect) {
      await onDisconnect();
    }
  } else if (connection === 'open') {
    logger.info('WhatsApp connection established successfully.');
  } else if (connection === 'connecting') {
    logger.info('Connecting to WhatsApp...');
  }
}
