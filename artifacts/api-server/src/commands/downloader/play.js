/**
 * .play <song name>
 * Searches YouTube for the best match and sends audio to WhatsApp.
 */

import { searchYouTube, downloadAudioBuffer } from '../../lib/downloaders/youtube.js';
import { logger } from '../../utils/logger.js';
import { truncate } from '../../utils/helpers.js';

export default {
  name: 'play',
  aliases: ['music', 'song'],
  description: 'Search and play a song from YouTube',
  category: 'downloader',
  usage: '.play <song name>',
  cooldown: 30,

  async execute({ sock, msg, jid, fullArgs }) {
    if (!fullArgs.trim()) {
      return sock.sendMessage(jid, {
        text: '🎵 *Usage:* .play <song name>\n\n*Example:* .play Bohemian Rhapsody Queen',
      }, { quoted: msg });
    }

    const query = fullArgs.trim();
    let searchMsg;

    try {
      searchMsg = await sock.sendMessage(jid, {
        text: `🔍 *Searching YouTube...*\n\n🎵 Query: _${truncate(query, 60)}_`,
      }, { quoted: msg });

      const result = await searchYouTube(query);

      await sock.sendMessage(jid, {
        text: `✅ *Found:* ${result.title}\n👤 *Channel:* ${result.channel}\n⏱ *Duration:* ${result.duration}\n👁 *Views:* ${result.views}\n\n⬇️ *Downloading audio...*`,
      }, { quoted: msg });

      const buffer = await downloadAudioBuffer(result.url);

      await sock.sendMessage(jid, {
        audio: buffer,
        mimetype: 'audio/mp4',
        fileName: `${truncate(result.title, 50)}.mp3`,
        pttAudio: false,
      }, { quoted: msg });

      logger.info(`[play] Sent audio: "${result.title}" to ${jid}`);
    } catch (err) {
      logger.error(`[play] Failed for query "${query}": ${err.message}`);
      await sock.sendMessage(jid, {
        text: `❌ *Failed to play song.*\n\nReason: ${err.message}\n\nTry a more specific song name or use _.ytmp3 <youtube url>_`,
      }, { quoted: msg });
    }
  },
};
