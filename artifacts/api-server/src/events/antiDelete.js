/**
 * Anti-Delete Recovery — RAHL XMD Security Engine
 *
 * Caches incoming messages (with media buffers) for chats where antidelete
 * is enabled. When a message delete event fires, recovers and resends the
 * original content with full RAHL XMD branding.
 *
 * Hooked via:
 *   cacheIncoming(sock, msg)      — call from messages.upsert
 *   handleDeletedMessages(sock, keys) — call from messages.delete
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
  if (m.extendedTextMessage?.text) return 'text';
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

    const isGroupChat = jid.endsWith('@g.us');
    const sender = isGroupChat ? (msg.key.participant || jid) : jid;
    const pushName = msg.pushName || sender.split('@')[0];

    let buffer = null;
    if (MEDIA_TYPES.has(type)) {
      try {
        buffer = await downloadMediaMessage(msg, 'buffer', {});
      } catch (_) {}
    }

    storeMessage(id, {
      msg,
      buffer,
      type,
      sender,
      pushName,
      jid,
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
      const typeLabel = {
        text: '💬 Text', image: '🖼️ Image', video: '🎥 Video',
        audio: '🎵 Audio', voice: '🎙️ Voice Note', document: '📄 Document',
        sticker: '🎭 Sticker', location: '📍 Location', contact: '👤 Contact',
      }[type] || '📦 Unknown';

      const header = `╔══════════════════╗\n     🦅 *RAHL XMD*\n╚══════════════════╝\n\n🚨 *DELETED MESSAGE FOUND*\n\n👤 *Sender:* @${senderNum}\n📂 *Type:* ${typeLabel}\n🛡️ *Protection:* ACTIVE 🟢`;

      if (type === 'text' && text) {
        await sock.sendMessage(jid, {
          text: `${header}\n\n📝 *Message:*\n${text}\n\n♻️ *Recovery:* SUCCESS ✅\n\n⚡ _RAHL SECURITY SYSTEM_`,
          mentions: [sender],
        });
      } else if (buffer && type === 'image') {
        await sock.sendMessage(jid, {
          text: `${header}\n\n♻️ *Recovery:* SUCCESS ✅\n⚡ _RAHL SECURITY SYSTEM_`,
          mentions: [sender],
        });
        await sock.sendMessage(jid, {
          image: buffer,
          caption: caption ? `📝 _Caption:_ ${caption}` : '📸 Recovered image',
        });
      } else if (buffer && type === 'video') {
        await sock.sendMessage(jid, {
          text: `${header}\n\n♻️ *Recovery:* SUCCESS ✅\n⚡ _RAHL SECURITY SYSTEM_`,
          mentions: [sender],
        });
        await sock.sendMessage(jid, {
          video: buffer,
          caption: caption ? `📝 _Caption:_ ${caption}` : '🎥 Recovered video',
          mimetype: 'video/mp4',
        });
      } else if (buffer && (type === 'audio' || type === 'voice')) {
        await sock.sendMessage(jid, {
          text: `${header}\n\n♻️ *Recovery:* SUCCESS ✅\n⚡ _RAHL SECURITY SYSTEM_`,
          mentions: [sender],
        });
        await sock.sendMessage(jid, {
          audio: buffer,
          mimetype: 'audio/mp4',
          pttAudio: type === 'voice',
        });
      } else if (buffer && type === 'document') {
        const fname = entry.msg.message?.documentMessage?.fileName || 'document';
        const mime = entry.msg.message?.documentMessage?.mimetype || 'application/octet-stream';
        await sock.sendMessage(jid, {
          text: `${header}\n\n♻️ *Recovery:* SUCCESS ✅\n⚡ _RAHL SECURITY SYSTEM_`,
          mentions: [sender],
        });
        await sock.sendMessage(jid, {
          document: buffer,
          mimetype: mime,
          fileName: fname,
        });
      } else if (buffer && type === 'sticker') {
        await sock.sendMessage(jid, {
          text: `${header}\n\n♻️ *Recovery:* SUCCESS ✅\n⚡ _RAHL SECURITY SYSTEM_`,
          mentions: [sender],
        });
        await sock.sendMessage(jid, { sticker: buffer });
      } else {
        await sock.sendMessage(jid, {
          text: `${header}\n\n📦 _Media could not be recovered (expired or unavailable)._\n\n♻️ *Recovery:* PARTIAL ⚠️\n⚡ _RAHL SECURITY SYSTEM_`,
          mentions: [sender],
        });
      }

      logger.info(`[antiDelete] Recovered ${type} message from ${senderNum} in ${jid}`);
    }
  } catch (err) {
    logger.error('[antiDelete] handleDeletedMessages error:', err.message);
  }
}
