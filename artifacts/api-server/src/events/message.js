import Group from '../database/models/Group.js';
import { getJidNumber } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';

const URL_REGEX = /(https?:\/\/[^\s]+)/gi;
const WHATSAPP_LINK_REGEX = /chat\.whatsapp\.com\/[A-Za-z0-9]+/gi;

export async function getGroupAntiSettings(jid) {
  try {
    return await Group.findOne({ jid }).lean();
  } catch {
    return null;
  }
}

export async function checkAntiLink(sock, msg, jid, sender) {
  const body =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    '';

  const hasWhatsAppLink = WHATSAPP_LINK_REGEX.test(body);
  if (!hasWhatsAppLink) return false;

  try {
    const metadata = await sock.groupMetadata(jid);
    const participants = metadata.participants || [];
    const senderNum = getJidNumber(sender);
    const isAdmin = participants.some(
      (p) =>
        getJidNumber(p.id) === senderNum &&
        (p.admin === 'admin' || p.admin === 'superadmin'),
    );
    if (isAdmin) return false;

    await sock.sendMessage(jid, {
      text: `@${senderNum} ⚠️ *Anti-Link Active* — WhatsApp group links are not allowed here!`,
      mentions: [sender],
    });

    await sock.groupParticipantsUpdate(jid, [sender], 'remove').catch(() => {});
    logger.info(`Anti-link: removed ${senderNum} from ${jid}`);
    return true;
  } catch (err) {
    logger.error('Anti-link error:', err.message);
    return false;
  }
}
