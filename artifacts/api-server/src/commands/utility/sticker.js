import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { FOOTER } from '../../utils/helpers.js';

export default {
  name: 'sticker',
  aliases: ['s', 'stiker'],
  description: 'Convert image/video to sticker',
  category: 'utility',
  cooldown: 5,

  async execute({ sock, msg, jid }) {
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
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
      let buffer;
      if (quoted?.imageMessage || quoted?.videoMessage) {
        const fakeMsg = {
          key: {
            remoteJid: jid,
            id: ctx.stanzaId || '',
            participant: ctx.participant,
          },
          message: quoted,
        };
        buffer = await downloadMediaMessage(fakeMsg, 'buffer', {});
      } else {
        buffer = await downloadMediaMessage(msg, 'buffer', {});
      }

      await sock.sendMessage(jid, { sticker: buffer }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ Failed to create sticker: ${err.message}\n\n${FOOTER}`,
      }, { quoted: msg });
    }
  },
};
