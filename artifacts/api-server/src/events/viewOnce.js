/**
 * View-Once Recovery — RAHL XMD Security Engine
 *
 * Automatically detects view-once messages (photos, videos, audio) and
 * re-sends them as normal media before they disappear.
 *
 * Hooked via:
 *   handleViewOnce(sock, msg) — call from messages.upsert for every message
 */

import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { logger } from '../utils/logger.js';

function extractViewOnceContent(msg) {
  const m = msg.message;
  if (!m) return null;

  const inner =
    m.viewOnceMessage?.message ||
    m.viewOnceMessageV2?.message ||
    m.viewOnceMessageV2Extension?.message ||
    null;

  if (!inner) return null;

  if (inner.imageMessage) return { type: 'image', message: inner, caption: inner.imageMessage.caption };
  if (inner.videoMessage) return { type: 'video', message: inner, caption: inner.videoMessage.caption };
  if (inner.audioMessage) return { type: 'audio', message: inner, ptt: inner.audioMessage.ptt };

  return null;
}

export async function handleViewOnce(sock, msg) {
  try {
    const jid = msg.key?.remoteJid;
    if (!jid || msg.key?.fromMe) return;

    const found = extractViewOnceContent(msg);
    if (!found) return;

    const isGroup = jid.endsWith('@g.us');
    const sender = isGroup ? (msg.key.participant || jid) : jid;
    const senderNum = sender.split('@')[0];

    const typeLabel = found.type === 'image' ? '🖼️ Image' : found.type === 'video' ? '🎥 Video' : '🎵 Audio';

    await sock.sendMessage(jid, {
      text: `╔══════════════════╗\n   🦅 *RAHL XMD*\n╚══════════════════╝\n\n👁️ *VIEW ONCE DETECTED*\n\n👤 *From:* @${senderNum}\n📂 *Media:* ${typeLabel}\n\n🔓 _Processing..._`,
      mentions: [sender],
    });

    const fakeMsg = {
      key: msg.key,
      message: found.message,
    };

    const buffer = await downloadMediaMessage(fakeMsg, 'buffer', {});

    if (found.type === 'image') {
      await sock.sendMessage(jid, {
        image: buffer,
        caption: `${found.caption ? found.caption + '\n\n' : ''}♻️ *Unlocked Successfully* ✅\n📦 *Media Restored*\n\n⚡ _RAHL XMD_`,
      });
    } else if (found.type === 'video') {
      await sock.sendMessage(jid, {
        video: buffer,
        mimetype: 'video/mp4',
        caption: `${found.caption ? found.caption + '\n\n' : ''}♻️ *Unlocked Successfully* ✅\n📦 *Media Restored*\n\n⚡ _RAHL XMD_`,
      });
    } else if (found.type === 'audio') {
      await sock.sendMessage(jid, {
        audio: buffer,
        mimetype: 'audio/mp4',
        pttAudio: found.ptt || false,
      });
      await sock.sendMessage(jid, {
        text: `♻️ *Unlocked Successfully* ✅\n📦 *Voice/Audio Restored*\n\n⚡ _RAHL XMD_`,
      });
    }

    logger.info(`[viewOnce] Recovered ${found.type} from ${senderNum} in ${jid}`);
  } catch (err) {
    logger.error('[viewOnce] Error:', err.message);
  }
}
