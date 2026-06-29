/**
 * Anti-Delete Recovery — RAHL XMD
 *
 * Global, always-on. No command needed. No per-chat toggle.
 * Every message in every chat is cached automatically.
 * When anyone deletes a message, the bot immediately resends it to that same chat.
 *
 * Hooked via:
 *   cacheIncoming(sock, msg)          — call on messages.upsert
 *   handleDeletedMessages(sock, item) — call on messages.delete / messages.update
 */

import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { storeMessage, getStoredMessage } from '../lib/messageCache.js';
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

/**
 * Cache every incoming message (except the bot's own messages).
 * Media is downloaded in background so this never blocks message flow.
 */
export async function cacheIncoming(sock, msg) {
  try {
    const jid = msg.key?.remoteJid;
    const id  = msg.key?.id;

    // Skip bot's own messages and system messages
    if (!jid || !id || msg.key?.fromMe) return;

    const type = getMessageType(msg);
    if (!type) return; // skip protocol/system messages

    const isGroup = jid.endsWith('@g.us');
    const sender  = isGroup ? (msg.key.participant || jid) : jid;
    const pushName = msg.pushName || sender.split('@')[0];

    // Store immediately with null buffer, then fill buffer async
    storeMessage(id, {
      msg, buffer: null, type, sender, pushName, jid,
      text: getTextContent(msg),
      caption: getCaption(msg),
    });

    // Download media in background — doesn't block anything
    if (MEDIA_TYPES.has(type)) {
      downloadMediaMessage(msg, 'buffer', {})
        .then((buf) => {
          const entry = getStoredMessage(id);
          if (entry) entry.buffer = buf;
        })
        .catch(() => {});
    }
  } catch (err) {
    logger.error('[antiDelete] cacheIncoming error:', err.message);
  }
}

/**
 * When a message is deleted, recover and resend it to the same chat automatically.
 */
export async function handleDeletedMessages(sock, item) {
  try {
    const keys = 'keys' in item ? item.keys : [];

    for (const key of keys) {
      const id  = key.id;
      const jid = key.remoteJid;
      if (!id || !jid) continue;

      // Skip if it was the bot's own message being deleted
      if (key.fromMe) continue;

      const entry = getStoredMessage(id);
      if (!entry) continue; // not in cache (too old or never stored)

      const { type, sender, pushName, text, caption, buffer } = entry;
      const senderNum = sender.split('@')[0];
      const isGroup   = jid.endsWith('@g.us');

      const typeLabel = {
        text: '💬 Text', image: '🖼️ Image', video: '🎥 Video',
        audio: '🎵 Audio', voice: '🎙️ Voice Note', document: '📄 Document',
        sticker: '🎭 Sticker', location: '📍 Location', contact: '👤 Contact',
      }[type] || '📦 Message';

      const target   = jid; // resend to same chat
      const mentions = isGroup ? [sender] : [];
      const senderTag = isGroup ? `@${senderNum}` : pushName || senderNum;

      const header =
        `╔══════════════════╗\n` +
        `     🦅 *RAHL XMD*\n` +
        `╚══════════════════╝\n\n` +
        `🚨 *DELETED MESSAGE CAUGHT!*\n\n` +
        `👤 *From:* ${senderTag}\n` +
        `📂 *Type:* ${typeLabel}\n` +
        `🛡️ *Anti-Delete:* ON 🟢`;

      if (type === 'text' && text) {
        await sock.sendMessage(target, {
          text: `${header}\n\n📝 *Message:*\n${text}\n\n♻️ _RAHL XMD_`,
          mentions,
        });

      } else if (buffer && type === 'image') {
        await sock.sendMessage(target, {
          image: buffer,
          caption: `${header}${caption ? `\n\n📝 ${caption}` : ''}\n\n♻️ _RAHL XMD_`,
          mentions,
        });

      } else if (buffer && type === 'video') {
        await sock.sendMessage(target, {
          video: buffer,
          caption: `${header}${caption ? `\n\n📝 ${caption}` : ''}\n\n♻️ _RAHL XMD_`,
          mimetype: 'video/mp4',
          mentions,
        });

      } else if (buffer && (type === 'audio' || type === 'voice')) {
        await sock.sendMessage(target, {
          text: `${header}\n\n♻️ _RAHL XMD_`,
          mentions,
        });
        await sock.sendMessage(target, {
          audio: buffer,
          mimetype: 'audio/mp4',
          pttAudio: type === 'voice',
        });

      } else if (buffer && type === 'document') {
        const fname = entry.msg.message?.documentMessage?.fileName || 'file';
        const mime  = entry.msg.message?.documentMessage?.mimetype || 'application/octet-stream';
        await sock.sendMessage(target, {
          text: `${header}\n\n♻️ _RAHL XMD_`,
          mentions,
        });
        await sock.sendMessage(target, { document: buffer, mimetype: mime, fileName: fname });

      } else if (buffer && type === 'sticker') {
        await sock.sendMessage(target, {
          text: `${header}\n\n♻️ _RAHL XMD_`,
          mentions,
        });
        await sock.sendMessage(target, { sticker: buffer });

      } else {
        // Media was deleted before the background download finished
        await sock.sendMessage(target, {
          text: `${header}\n\n📦 _A ${typeLabel.toLowerCase()} was deleted._\n\n♻️ _RAHL XMD_`,
          mentions,
        });
      }

      logger.info(`[antiDelete] Recovered ${type} from ${senderNum} in ${jid}`);
    }
  } catch (err) {
    logger.error('[antiDelete] handleDeletedMessages error:', err.message);
  }
}
