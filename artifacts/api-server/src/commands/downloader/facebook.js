/**
 * .facebook <URL>
 * Downloads a public Facebook video and sends it to WhatsApp.
 */

import { isFacebookUrl, downloadFacebook } from '../../lib/downloaders/facebook.js';
import { logger } from '../../utils/logger.js';
import { truncate } from '../../utils/helpers.js';

export default {
  name: 'facebook',
  aliases: ['fb', 'fbdl'],
  description: 'Download a public Facebook video',
  category: 'downloader',
  usage: '.facebook <Facebook video URL>',
  cooldown: 20,

  async execute({ sock, msg, jid, fullArgs }) {
    const url = fullArgs.trim();

    if (!url) {
      return sock.sendMessage(jid, {
        text: '📘 *Usage:* .facebook <Facebook video URL>\n\n*Example:* .facebook https://www.facebook.com/watch?v=...\n\n⚠️ _Only public videos are supported._',
      }, { quoted: msg });
    }

    if (!isFacebookUrl(url)) {
      return sock.sendMessage(jid, {
        text: '❌ *Invalid URL.* Please provide a valid Facebook video link.\n\n*Supported:*\n• facebook.com/watch?v=...\n• facebook.com/.../videos/...\n• fb.watch/...',
      }, { quoted: msg });
    }

    try {
      await sock.sendMessage(jid, {
        text: `⬇️ *Fetching Facebook video...*\n🔗 ${truncate(url, 60)}`,
      }, { quoted: msg });

      const data = await downloadFacebook(url);
      const videoUrl = data.hd || data.sd;
      const quality = data.hd ? 'HD' : 'SD';

      await sock.sendMessage(jid, {
        text: `⬆️ *Uploading video...*\n\n📘 *${truncate(data.title, 60)}*\n📦 *Quality:* ${quality}`,
      }, { quoted: msg });

      await sock.sendMessage(jid, {
        video: { url: videoUrl },
        mimetype: 'video/mp4',
        caption: `📘 *${truncate(data.title, 60)}*`,
        fileName: `facebook_${Date.now()}.mp4`,
      }, { quoted: msg });

      logger.info(`[facebook] Sent video: "${data.title}" (${quality}) to ${jid}`);
    } catch (err) {
      logger.error(`[facebook] Failed for URL "${url}": ${err.message}`);
      await sock.sendMessage(jid, {
        text: `❌ *Download failed.*\n\nReason: ${err.message}\n\n_Only public Facebook videos can be downloaded._`,
      }, { quoted: msg });
    }
  },
};
