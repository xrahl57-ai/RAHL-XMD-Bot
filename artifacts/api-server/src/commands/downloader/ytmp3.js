/**
 * .ytmp3 <YouTube URL>
 * Downloads YouTube audio and sends it as an audio file.
 */

import { isYouTubeUrl, getYouTubeInfo, downloadAudioBuffer } from '../../lib/downloaders/youtube.js';
import { logger } from '../../utils/logger.js';
import { truncate } from '../../utils/helpers.js';

export default {
  name: 'ytmp3',
  aliases: ['ytaudio', 'ymp3'],
  description: 'Download YouTube audio as MP3',
  category: 'downloader',
  usage: '.ytmp3 <YouTube URL>',
  cooldown: 30,

  async execute({ sock, msg, jid, fullArgs }) {
    const url = fullArgs.trim();

    if (!url) {
      return sock.sendMessage(jid, {
        text: '🎵 *Usage:* .ytmp3 <YouTube URL>\n\n*Example:* .ytmp3 https://youtu.be/dQw4w9WgXcQ',
      }, { quoted: msg });
    }

    if (!isYouTubeUrl(url)) {
      return sock.sendMessage(jid, {
        text: '❌ *Invalid URL.* Please provide a valid YouTube link.\n\n*Supported:*\n• youtube.com/watch?v=...\n• youtu.be/...\n• youtube.com/shorts/...',
      }, { quoted: msg });
    }

    try {
      await sock.sendMessage(jid, {
        text: `🔍 *Fetching video info...*\n🔗 ${truncate(url, 60)}`,
      }, { quoted: msg });

      const info = await getYouTubeInfo(url);

      if (info.durationSeconds > 900) {
        return sock.sendMessage(jid, {
          text: `⚠️ *Video too long (${info.duration}).*\n\nMaximum supported duration is 15 minutes for audio downloads.`,
        }, { quoted: msg });
      }

      await sock.sendMessage(jid, {
        text: `📥 *Preparing download...*\n\n🎵 *Title:* ${truncate(info.title, 60)}\n👤 *Channel:* ${info.channel}\n⏱ *Duration:* ${info.duration}\n\n⬇️ _Downloading audio, please wait..._`,
      }, { quoted: msg });

      const buffer = await downloadAudioBuffer(url);

      await sock.sendMessage(jid, {
        audio: buffer,
        mimetype: 'audio/mp4',
        fileName: `${truncate(info.title, 50)}.mp3`,
        pttAudio: false,
      }, { quoted: msg });

      logger.info(`[ytmp3] Sent audio: "${info.title}" (${info.duration}) to ${jid}`);
    } catch (err) {
      logger.error(`[ytmp3] Failed for URL "${url}": ${err.message}`);
      await sock.sendMessage(jid, {
        text: `❌ *Download failed.*\n\nReason: ${err.message}`,
      }, { quoted: msg });
    }
  },
};
