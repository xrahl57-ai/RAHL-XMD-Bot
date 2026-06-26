/**
 * .save
 * Reply to any WhatsApp status or message to save and download its media.
 * Supports images, videos, audio, and voice notes with captions.
 */

import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { logger } from '../../utils/logger.js';
import { truncate } from '../../utils/helpers.js';

function getQuotedContent(msg) {
  const ctx = msg.message?.extendedTextMessage?.contextInfo;
  if (!ctx?.quotedMessage) return null;

  const qm = ctx.quotedMessage;
  const participant = ctx.participant || ctx.remoteJid || '';

  if (qm.imageMessage) return { type: 'image', message: qm, participant, caption: qm.imageMessage.caption };
  if (qm.videoMessage) return { type: 'video', message: qm, participant, caption: qm.videoMessage.caption };
  if (qm.audioMessage) return { type: 'audio', message: qm, participant, ptt: qm.audioMessage.ptt };
  if (qm.conversation || qm.extendedTextMessage) {
    return {
      type: 'text',
      text: qm.conversation || qm.extendedTextMessage?.text,
      participant,
    };
  }

  return null;
}

export default {
  name: 'save',
  aliases: ['savestatus', 'ss', 'dlstatus'],
  description: 'Reply to a status or message to save its media',
  category: 'utility',
  usage: '.save (reply to a status/message)',
  cooldown: 10,

  async execute({ sock, msg, jid, pushName }) {
    const quoted = getQuotedContent(msg);

    if (!quoted) {
      return sock.sendMessage(jid, {
        text: `╭━━━━━━━━━━━━━━╮\n    🦅 *RAHL XMD*\n╰━━━━━━━━━━━━━━╯\n\n📥 *STATUS SAVER*\n\n❌ *No media found.*\n\n📌 *How to use:*\n1. Open a WhatsApp status\n2. Reply to it with *.save*\n3. Bot will download and send it\n\n✅ *Supports:*\n🖼️ Images | 🎥 Videos | 🎵 Audio`,
      }, { quoted: msg });
    }

    const senderNum = quoted.participant?.split('@')[0] || 'Unknown';
    const typeLabel = { image: '🖼️ Image', video: '🎥 Video', audio: '🎵 Audio', text: '💬 Text' }[quoted.type] || '📦 Media';

    await sock.sendMessage(jid, {
      text: `╭━━━━━━━━━━━━━━╮\n    🦅 *RAHL XMD*\n╰━━━━━━━━━━━━━━╯\n\n📥 *STATUS SAVER*\n\n👤 *From:* @${senderNum}\n📂 *Type:* ${typeLabel}\n\n⏳ _Processing..._`,
      mentions: quoted.participant ? [quoted.participant] : [],
    }, { quoted: msg });

    try {
      if (quoted.type === 'text') {
        return sock.sendMessage(jid, {
          text: `✅ *Status Saved*\n\n💬 *Content:*\n${truncate(quoted.text, 500)}\n\n🔥 _Enjoy!_`,
        }, { quoted: msg });
      }

      const stanzaId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
      const fakeMsg = {
        key: {
          remoteJid: jid,
          id: stanzaId || '',
          participant: quoted.participant,
        },
        message: quoted.message,
      };

      const buffer = await downloadMediaMessage(fakeMsg, 'buffer', {});
      const captionSuffix = `\n\n✅ *Status Saved* 🔥\n⚡ _RAHL XMD_`;
      const caption = quoted.caption ? `${truncate(quoted.caption, 200)}${captionSuffix}` : `📥 *Saved Status*${captionSuffix}`;

      if (quoted.type === 'image') {
        await sock.sendMessage(jid, { image: buffer, caption });
      } else if (quoted.type === 'video') {
        await sock.sendMessage(jid, { video: buffer, mimetype: 'video/mp4', caption });
      } else if (quoted.type === 'audio') {
        await sock.sendMessage(jid, {
          audio: buffer,
          mimetype: 'audio/mp4',
          pttAudio: quoted.ptt || false,
        });
        await sock.sendMessage(jid, {
          text: `✅ *Audio Status Saved* 🔥\n⚡ _RAHL XMD_`,
        });
      }

      logger.info(`[save] Saved ${quoted.type} status from ${senderNum} for ${jid}`);
    } catch (err) {
      logger.error(`[save] Failed: ${err.message}`);
      await sock.sendMessage(jid, {
        text: `❌ *Failed to save status.*\n\nReason: ${err.message}\n\n_The media may have expired or the status is private._`,
      }, { quoted: msg });
    }
  },
};
