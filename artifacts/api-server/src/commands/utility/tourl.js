import axios from 'axios';
import FormData from 'form-data';
import { FOOTER } from '../../utils/helpers.js';

export default {
  name: 'tourl',
  aliases: ['upload', 'imgurl'],
  description: 'Upload media and get a URL',
  category: 'utility',
  cooldown: 10,

  async execute({ sock, msg, jid }) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const mediaMsg = msg.message?.imageMessage || msg.message?.videoMessage ||
      quoted?.imageMessage || quoted?.videoMessage;

    if (!mediaMsg) {
      return sock.sendMessage(jid, {
        text: `❌ Reply to or send media with .tourl\n\n${FOOTER}`,
      }, { quoted: msg });
    }

    try {
      const buffer = await sock.downloadMediaMessage(
        quoted ? { message: quoted, key: msg.key } : msg,
      );

      const form = new FormData();
      form.append('file', buffer, { filename: 'media.jpg', contentType: 'image/jpeg' });

      const res = await axios.post('https://telegra.ph/upload', form, {
        headers: form.getHeaders(),
        timeout: 15000,
      });

      const url = `https://telegra.ph${res.data[0]?.src}`;
      await sock.sendMessage(jid, {
        text: `🔗 *Media URL*\n\n${url}\n\n${FOOTER}`,
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ Upload failed: ${err.message}\n\n${FOOTER}`,
      }, { quoted: msg });
    }
  },
};
