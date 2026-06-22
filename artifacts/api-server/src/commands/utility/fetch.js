import axios from 'axios';
import { isUrl, FOOTER } from '../../utils/helpers.js';

export default {
  name: 'fetch',
  aliases: ['get', 'curl'],
  description: 'Fetch content from a URL',
  category: 'utility',
  cooldown: 5,

  async execute({ sock, msg, jid, args }) {
    const url = args[0];
    if (!url || !isUrl(url)) {
      return sock.sendMessage(jid, {
        text: `❌ Usage: .fetch <url>\nExample: .fetch https://api.github.com/zen\n\n${FOOTER}`,
      }, { quoted: msg });
    }

    try {
      const res = await axios.get(url, { timeout: 8000, responseType: 'text' });
      const content = String(res.data).slice(0, 2000);
      await sock.sendMessage(jid, {
        text: `🌐 *Response from:* ${url}\n\n\`\`\`\n${content}\n\`\`\`\n\n${FOOTER}`,
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ Fetch failed: ${err.message}\n\n${FOOTER}`,
      }, { quoted: msg });
    }
  },
};
