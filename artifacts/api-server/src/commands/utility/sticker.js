import { FOOTER } from '../../utils/helpers.js';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFileSync, unlinkSync } from 'fs';
import { randomBytes } from 'crypto';

export default {
  name: 'sticker',
  aliases: ['s', 'stiker'],
  description: 'Convert image/video to sticker',
  category: 'utility',
  cooldown: 5,

  async execute({ sock, msg, jid }) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const mediaMsg = msg.message?.imageMessage ||
      msg.message?.videoMessage ||
      quoted?.imageMessage ||
      quoted?.videoMessage;

    if (!mediaMsg) {
      return sock.sendMessage(jid, {
        text: `🖼️ Send or reply to an image/video with .sticker\n\n${FOOTER}`,
      }, { quoted: msg });
    }

    try {
      const buffer = await sock.downloadMediaMessage(
        quoted ? { message: quoted, key: msg.key } : msg,
      );

      await sock.sendMessage(jid, {
        sticker: buffer,
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ Failed to create sticker: ${err.message}\n\n${FOOTER}`,
      }, { quoted: msg });
    }
  },
};
