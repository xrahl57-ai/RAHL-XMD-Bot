import axios from 'axios';
import { isUrl } from '../../utils/helpers.js';

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
        text:
          `❌ *Usage:* .shorturl <url>\n` +
          `🔗 *Example:* .shorturl https://www.example.com/very/long/link`,
      }, { quoted: msg });
    }

    try {
      const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, {
        timeout: 8000,
        responseType: 'text',
      });

      const shortLink = res.data;
      const saved = url.length - shortLink.length;

      await sock.sendMessage(jid, {
        text:
          `╔══════════════════════╗\n` +
          `║  ✂️  *URL SHORTENER*  ✂️  ║\n` +
          `╚══════════════════════╝\n\n` +
          `✅ *Shortened Successfully!*\n\n` +
          `🔗 *Original* ➜ ${url}\n` +
          `✨ *Short URL* ➜ ${shortLink}\n` +
          `💾 *Saved* ➜ ${saved > 0 ? saved + ' characters' : 'N/A'}\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `⚡ _RAHL XMD_ 🦅`,
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ *Failed to shorten URL*\n\n_${err.message}_`,
      }, { quoted: msg });
    }
  },
};
