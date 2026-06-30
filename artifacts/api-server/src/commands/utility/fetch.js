import axios from 'axios';
import { isUrl } from '../../utils/helpers.js';

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
        text:
          `❌ *Usage:* .fetch <url>\n` +
          `🌐 *Example:* .fetch https://api.github.com/zen`,
      }, { quoted: msg });
    }

    try {
      const start = Date.now();
      const res   = await axios.get(url, { timeout: 8000, responseType: 'text' });
      const ms    = Date.now() - start;
      const content = String(res.data).slice(0, 1500);

      await sock.sendMessage(jid, {
        text:
          `👑══════════════════════👑\n` +
          `    🌐  *URL FETCH*  🌐\n` +
          `👑══════════════════════👑\n\n` +
          `🔗 *URL* ➜ ${url}\n` +
          `⚡ *Status* ➜ ${res.status} OK\n` +
          `⏱️ *Time* ➜ ${ms}ms\n\n` +
          `✦══════════════════════✦\n\n` +
          `📄 *Response:*\n\`\`\`\n${content}\n\`\`\`\n\n` +
          `✦══════════════════════✦\n` +
          `⚡ _RAHL XMD_ 🦅`,
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text:
          `👑══════════════════════👑\n` +
          `    🌐  *URL FETCH*  🌐\n` +
          `👑══════════════════════👑\n\n` +
          `❌ *Fetch Failed*\n\n` +
          `🔗 *URL* ➜ ${url}\n` +
          `💥 *Error* ➜ ${err.message}`,
      }, { quoted: msg });
    }
  },
};
