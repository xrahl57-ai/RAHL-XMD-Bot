import axios from 'axios';
import { isUrl, FOOTER } from '../../utils/helpers.js';

export default {
  name: 'shorturl',
  aliases: ['short', 'tinyurl'],
  description: 'Shorten a URL',
  category: 'utility',
  cooldown: 5,

  async execute({ sock, msg, jid, args }) {
    const url = args[0];
    if (!url || !isUrl(url)) {
      return sock.sendMessage(jid, {
        text: `❌ Usage: .shorturl <url>\n\n${FOOTER}`,
      }, { quoted: msg });
    }

    try {
      const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, {
        timeout: 8000,
        responseType: 'text',
      });
      await sock.sendMessage(jid, {
        text: `🔗 *URL Shortened!*\n\n📎 Original: ${url}\n✂️ Short: ${res.data}\n\n${FOOTER}`,
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ Failed to shorten URL: ${err.message}\n\n${FOOTER}`,
      }, { quoted: msg });
    }
  },
};
