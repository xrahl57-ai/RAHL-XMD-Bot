import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { FOOTER } from '../../utils/helpers.js';

export default {
  name: 'toimg',
  aliases: ['toimage', 'stickertoimg'],
  description: 'Convert sticker to image',
  category: 'utility',
  cooldown: 5,

  async execute({ sock, msg, jid }) {
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
    const stickerMsg = quoted?.stickerMessage || msg.message?.stickerMessage;

    if (!stickerMsg) {
      return sock.sendMessage(jid, {
        text: `❌ Reply to a sticker with .toimg\n\n${FOOTER}`,
      }, { quoted: msg });
    }

    try {
      let buffer;
      if (quoted?.stickerMessage) {
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

      await sock.sendMessage(jid, { image: buffer }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ Failed to convert: ${err.message}\n\n${FOOTER}`,
      }, { quoted: msg });
    }
  },
};
