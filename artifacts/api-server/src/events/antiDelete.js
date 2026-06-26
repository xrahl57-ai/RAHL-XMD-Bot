/**
 * Anti-Delete Recovery — RAHL XMD Security Engine
 *
 * Caches incoming messages (with media buffers). When a delete event fires,
 * recovers the message and sends it to the BOT OWNER's DM (private chat).
 *
 * Hooked via:
 *   cacheIncoming(sock, msg)           — call from messages.upsert
 *   handleDeletedMessages(sock, keys)  — call from messages.delete
 */

import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { storeMessage, getStoredMessage } from '../lib/messageCache.js';
import { getAntiDelete } from '../lib/chatSettings.js';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';

const OWNER_JID = config.ownerJid; // e.g. 254112399557@s.whatsapp.net

function getMessageType(msg) {
  const m = msg.message;
  if (!m) return null;
  if (m.conversation || m.extendedTextMessage) return 'text';
  if (m.imageMessage) return 'image';
  if (m.videoMessage) return 'video';
  if (m.audioMessage) return m.audioMessage.ptt ? 'voice' : 'audio';
  if (m.documentMessage) return 'document';
  if (m.stickerMessage) return 'sticker';
  if (m.locationMessage) return 'location';
  if (m.contactMessage) return 'contact';
  return null;
}

function getTextContent(msg) {
  const m = msg.message;
  return m?.conversation || m?.extendedTextMessage?.text || null;
}

function getCaption(msg) {
  const m = msg.message;
  return m?.imageMessage?.caption || m?.videoMessage?.caption || m?.documentMessage?.caption || null;
}

const MEDIA_TYPES = new Set(['image', 'video', 'audio', 'voice', 'document', 'sticker']);

export async function cacheIncoming(sock, msg) {
  try {
    const jid = msg.key?.remoteJid;
    const id = msg.key?.id;
    if (!jid || !id || msg.key?.fromMe) return;

    const enabled = await getAntiDelete(jid);
    if (!enabled) return;

    const type = getMessageType(msg);
    if (!type) return;

    const isGroup = jid.endsWith('@g.us');
    const sender = isGroup ? (msg.key.participant || jid) : jid;
    const pushName = msg.pushName || sender.split('@')[0];

    let buffer = null;
    if (MEDIA_TYPES.has(type)) {
      try {
        buffer = await downloadMediaMessage(msg, 'buffer', {});
      } catch (_) {}
    }

    storeMessage(id, {
      msg, buffer, type, sender, pushName, jid,
      text: getTextContent(msg),
      caption: getCaption(msg),
    });
  } catch (err) {
    logger.error('[antiDelete] cacheIncoming error:', err.message);
  }
}

export async function handleDeletedMessages(sock, item) {
  try {
    const keys = 'keys' in item ? item.keys : [];
    for (const key of keys) {
      const id = key.id;
      const jid = key.remoteJid;
      if (!id || !jid) continue;

      const enabled = await getAntiDelete(jid);
      if (!enabled) continue;

      const entry = getStoredMessage(id);
      if (!entry) continue;

      const { type, sender, pushName, text, caption, buffer } = entry;
      const senderNum = sender.split('@')[0];
      const isGroup = jid.endsWith('@g.us');
      const chatLabel = isGroup ? `👥 Group: ${jid.split('@')[0]}` : `💬 Private Chat`;

      const typeLabel = {
        text: '💬 Text', image: '🖼️ Image', video: '🎥 Video',
        audio: '🎵 Audio', voice: '🎙️ Voice Note', document: '📄 Document',
        sticker: '🎭 Sticker', location: '📍 Location', contact: '👤 Contact',
      }[type] || '📦 Unknown';

      // Always send to OWNER DM
      const target = OWNER_JID;

      const header = `╔══════════════════╗\n     🦅 *RAHL XMD*\n╚══════════════════╝\n\n🚨 *DELETED MESSAGE RECOVERED*\n\n👤 *Sender:* @${senderNum} (${pushName})\n📍 *From:* ${chatLabel}\n📂 *Type:* ${typeLabel}\n🛡️ *Protection:* ACTIVE 🟢`;

      if (type === 'text' && text) {
        await sock.sendMessage(target, {
          text: `${header}\n\n📝 *Message:*\n${text}\n\n♻️ *Recovery:* SUCCESS ✅\n⚡ _RAHL SECURITY SYSTEM_`,
        });
      } else if (buffer && type === 'image') {
        await sock.sendMessage(target, {
          image: buffer,
          caption: `${header}\n\n${caption ? `📝 _Caption:_ ${caption}\n\n` : ''}♻️ *Recovery:* SUCCESS ✅\n⚡ _RAHL SECURITY SYSTEM_`,
        });
      } else if (buffer && type === 'video') {
        await sock.sendMessage(target, {
          video: buffer,
          caption: `${header}\n\n${caption ? `📝 _Caption:_ ${caption}\n\n` : ''}♻️ *Recovery:* SUCCESS ✅\n⚡ _RAHL SECURITY SYSTEM_`,
          mimetype: 'video/mp4',
        });
      } else if (buffer && (type === 'audio' || type === 'voice')) {
        await sock.sendMessage(target, {
          text: `${header}\n\n♻️ *Recovery:* SUCCESS ✅\n⚡ _RAHL SECURITY SYSTEM_`,
        });
        await sock.sendMessage(target, {
          audio: buffer,
          mimetype: 'audio/mp4',
          pttAudio: type === 'voice',
        });
      } else if (buffer && type === 'document') {
        const fname = entry.msg.message?.documentMessage?.fileName || 'document';
        const mime = entry.msg.message?.documentMessage?.mimetype || 'application/octet-stream';
        await sock.sendMessage(target, {
          text: `${header}\n\n♻️ *Recovery:* SUCCESS ✅\n⚡ _RAHL SECURITY SYSTEM_`,
        });
        await sock.sendMessage(target, {
          document: buffer, mimetype: mime, fileName: fname,
        });
      } else if (buffer && type === 'sticker') {
        await sock.sendMessage(target, {
          text: `${header}\n\n♻️ *Recovery:* SUCCESS ✅\n⚡ _RAHL SECURITY SYSTEM_`,
        });
        await sock.sendMessage(target, { sticker: buffer });
      } else {
        await sock.sendMessage(target, {
          text: `${header}\n\n📦 _Media expired or unavailable._\n\n♻️ *Recovery:* PARTIAL ⚠️\n⚡ _RAHL SECURITY SYSTEM_`,
        });
      }

      logger.info(`[antiDelete] Recovered ${type} from ${senderNum} → sent to owner DM`);
    }
  } catch (err) {
    logger.error('[antiDelete] handleDeletedMessages error:', err.message);
  }
}
