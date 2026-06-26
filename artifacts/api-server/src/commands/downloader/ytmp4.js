/**
 * .ytmp4 <YouTube URL>
 * Downloads YouTube video (≤360p) and sends it as a video file.
 */

import { isYouTubeUrl, getYouTubeInfo, getBestVideoFormat } from '../../lib/downloaders/youtube.js';
import { logger } from '../../utils/logger.js';
import { truncate } from '../../utils/helpers.js';

export default {
  name: 'ytmp4',
  aliases: ['ytvideo', 'ymp4'],
  description: 'Download YouTube video (up to 360p)',
  category: 'downloader',
  usage: '.ytmp4 <YouTube URL>',
  cooldown: 45,

  async execute({ sock, msg, jid, fullArgs }) {
    const url = fullArgs.trim();

    if (!url) {
      return sock.sendMessage(jid, {
        text: '🎬 *Usage:* .ytmp4 <YouTube URL>\n\n*Example:* .ytmp4 https://youtu.be/dQw4w9WgXcQ\n\n⚠️ _Max quality: 360p | Max size: 60 MB_',
      }, { quoted: msg });
    }

    if (!isYouTubeUrl(url)) {
      return sock.sendMessage(jid, {
        text: '❌ *Invalid URL.* Please provide a valid YouTube link.',
      }, { quoted: msg });
    }

    try {
      await sock.sendMessage(jid, {
        text: `🔍 *Fetching video info...*\n🔗 ${truncate(url, 60)}`,
      }, { quoted: msg });

      const info = await getYouTubeInfo(url);

      if (info.durationSeconds > 600) {
        return sock.sendMessage(jid, {
          text: `⚠️ *Video too long (${info.duration}).*\n\nMaximum supported duration is 10 minutes for video downloads.`,
        }, { quoted: msg });
      }

      await sock.sendMessage(jid, {
        text: `📥 *Preparing video...*\n\n🎬 *Title:* ${truncate(info.title, 60)}\n👤 *Channel:* ${info.channel}\n⏱ *Duration:* ${info.duration}\n\n⬇️ _Processing video, please wait..._`,
      }, { quoted: msg });

      const format = await getBestVideoFormat(url);

      await sock.sendMessage(jid, {
        text: `⬆️ *Uploading video...*\n📦 *Quality:* ${format.quality} | *Size:* ${format.sizeMB} MB`,
      }, { quoted: msg });

      await sock.sendMessage(jid, {
        video: { url: format.url },
        mimetype: 'video/mp4',
        caption: `🎬 *${truncate(info.title, 60)}*\n👤 ${info.channel} | ⏱ ${info.duration}`,
        fileName: `${truncate(info.title, 50)}.mp4`,
      }, { quoted: msg });

      logger.info(`[ytmp4] Sent video: "${info.title}" (${format.quality}, ${format.sizeMB}MB) to ${jid}`);
    } catch (err) {
      logger.error(`[ytmp4] Failed for URL "${url}": ${err.message}`);
      await sock.sendMessage(jid, {
        text: `❌ *Download failed.*\n\nReason: ${err.message}`,
      }, { quoted: msg });
    }
  },
};
