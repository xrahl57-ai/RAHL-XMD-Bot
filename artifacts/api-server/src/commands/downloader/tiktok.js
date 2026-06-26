/**
 * .tiktok <URL>
 * Downloads a TikTok video (no watermark) and sends it to WhatsApp.
 */

import { isTikTokUrl, downloadTikTok } from '../../lib/downloaders/tiktok.js';
import { logger } from '../../utils/logger.js';
import { truncate } from '../../utils/helpers.js';

export default {
  name: 'tiktok',
  aliases: ['tt', 'tiktak'],
  description: 'Download TikTok video without watermark',
  category: 'downloader',
  usage: '.tiktok <TikTok URL>',
  cooldown: 20,

  async execute({ sock, msg, jid, fullArgs }) {
    const url = fullArgs.trim();

    if (!url) {
      return sock.sendMessage(jid, {
        text: '🎵 *Usage:* .tiktok <TikTok URL>\n\n*Example:* .tiktok https://vm.tiktok.com/xxxxx',
      }, { quoted: msg });
    }

    if (!isTikTokUrl(url)) {
      return sock.sendMessage(jid, {
        text: '❌ *Invalid URL.* Please provide a valid TikTok link.\n\n*Supported:*\n• tiktok.com/@user/video/...\n• vm.tiktok.com/...\n• vt.tiktok.com/...',
      }, { quoted: msg });
    }

    try {
      await sock.sendMessage(jid, {
        text: `⬇️ *Downloading TikTok...*\n🔗 ${truncate(url, 60)}`,
      }, { quoted: msg });

      const data = await downloadTikTok(url);

      if (!data.video) throw new Error('No video URL returned from TikTok API.');

      await sock.sendMessage(jid, {
        text: `⬆️ *Uploading video...*\n\n🎵 *${truncate(data.title, 60)}*\n👤 *Author:* ${data.author}`,
      }, { quoted: msg });

      await sock.sendMessage(jid, {
        video: { url: data.video },
        mimetype: 'video/mp4',
        caption: `🎵 *${truncate(data.title, 60)}*\n👤 ${data.author}`,
        fileName: `tiktok_${Date.now()}.mp4`,
      }, { quoted: msg });

      logger.info(`[tiktok] Sent video: "${data.title}" by ${data.author} to ${jid}`);
    } catch (err) {
      logger.error(`[tiktok] Failed for URL "${url}": ${err.message}`);
      await sock.sendMessage(jid, {
        text: `❌ *Download failed.*\n\nReason: ${err.message}\n\n_Make sure the video is public._`,
      }, { quoted: msg });
    }
  },
};
