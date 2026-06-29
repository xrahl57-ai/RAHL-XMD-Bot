/**
 * Anti-Delete Recovery — RAHL XMD Security Engine
 *
 * Caches incoming messages (with media buffers). When a delete event fires,
 * recovers the message and sends it to the SAME CHAT (DM of the person or group).
 *
 * Hooked via:
 *   cacheIncoming(sock, msg)           — call from messages.upsert
 *   handleDeletedMessages(sock, keys)  — call from messages.delete / messages.update
 */

import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { storeMessage, getStoredMessage } from '../lib/messageCache.js';
import { getAntiDelete } from '../lib/chatSettings.js';
import { logger } from '../utils/logger.js';

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
      // Download in background — don't block message flow
      downloadMediaMessage(msg, 'buffer', {})
        .then((buf) => {
          const entry = getStoredMessage(id);
          if (entry) entry.buffer = buf;
        })
        .catch(() => {});
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

      const typeLabel = {
        text: '💬 Text', image: '🖼️ Image', video: '🎥 Video',
        audio: '🎵 Audio', voice: '🎙️ Voice Note', document: '📄 Document',
        sticker: '🎭 Sticker', location: '📍 Location', contact: '👤 Contact',
      }[type] || '📦 Unknown';

      // Send recovered message back to the SAME CHAT (DM of person or group)
      // so the person using the bot sees the deleted content immediately
      const target = jid;

      const header = `╔══════════════════╗\n     🦅 *RAHL XMD*\n╚══════════════════╝\n\n🚨 *DELETED MESSAGE RECOVERED*\n\n👤 *Sender:* @${senderNum}${pushName !== senderNum ? ` (${pushName})` : ''}\n📂 *Type:* ${typeLabel}\n🛡️ *Anti-Delete:* ACTIVE 🟢`;

      const mentions = isGroup ? [sender] : [];

      if (type === 'text' && text) {
        await sock.sendMessage(target, {
          text: `${header}\n\n📝 *Message:*\n${text}\n\n♻️ _Recovered by RAHL XMD_`,
          mentions,
        });
      } else if (buffer && type === 'image') {
        await sock.sendMessage(target, {
          image: buffer,
          caption: `${header}\n\n${caption ? `📝 _Caption:_ ${caption}\n\n` : ''}♻️ _Recovered by RAHL XMD_`,
          mentions,
        });
      } else if (buffer && type === 'video') {
        await sock.sendMessage(target, {
          video: buffer,
          caption: `${header}\n\n${caption ? `📝 _Caption:_ ${caption}\n\n` : ''}♻️ _Recovered by RAHL XMD_`,
          mimetype: 'video/mp4',
          mentions,
        });
      } else if (buffer && (type === 'audio' || type === 'voice')) {
        await sock.sendMessage(target, {
          text: `${header}\n\n♻️ _Recovered by RAHL XMD_`,
          mentions,
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
          text: `${header}\n\n♻️ _Recovered by RAHL XMD_`,
          mentions,
        });
        await sock.sendMessage(target, { document: buffer, mimetype: mime, fileName: fname });
      } else if (buffer && type === 'sticker') {
        await sock.sendMessage(target, {
          text: `${header}\n\n♻️ _Recovered by RAHL XMD_`,
          mentions,
        });
        await sock.sendMessage(target, { sticker: buffer });
      } else {
        await sock.sendMessage(target, {
          text: `${header}\n\n📦 _Media not yet cached — try again after a moment._\n\n♻️ _RAHL XMD_`,
          mentions,
        });
      }

      logger.info(`[antiDelete] Recovered ${type} from ${senderNum} → sent to ${jid}`);
    }
  } catch (err) {
    logger.error('[antiDelete] handleDeletedMessages error:', err.message);
  }
}
