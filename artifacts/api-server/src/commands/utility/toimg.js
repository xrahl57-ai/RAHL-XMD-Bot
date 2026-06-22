import { FOOTER } from '../../utils/helpers.js';

export default {
  name: 'toimg',
  aliases: ['toimage', 'stickertoimg'],
  description: 'Convert sticker to image',
  category: 'utility',
  cooldown: 5,

  async execute({ sock, msg, jid }) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const stickerMsg = quoted?.stickerMessage || msg.message?.stickerMessage;

    if (!stickerMsg) {
      return sock.sendMessage(jid, {
        text: `❌ Reply to a sticker with .toimg\n\n${FOOTER}`,
      }, { quoted: msg });
    }

    try {
      const buffer = await sock.downloadMediaMessage(
        quoted ? { message: quoted, key: msg.key } : msg,
      );
      await sock.sendMessage(jid, { image: buffer }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ Failed to convert: ${err.message}\n\n${FOOTER}`,
      }, { quoted: msg });
    }
  },
};
