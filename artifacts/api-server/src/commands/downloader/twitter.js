/**
 * .twitter <URL>
 * Downloads a public Twitter/X video and sends it to WhatsApp.
 */

import { isTwitterUrl, downloadTwitter } from '../../lib/downloaders/twitter.js';
import { logger } from '../../utils/logger.js';
import { truncate } from '../../utils/helpers.js';

export default {
  name: 'twitter',
  aliases: ['tw', 'xdl', 'twdl'],
  description: 'Download a Twitter/X video',
  category: 'downloader',
  usage: '.twitter <Tweet URL>',
  cooldown: 20,

  async execute({ sock, msg, jid, fullArgs }) {
    const url = fullArgs.trim();

    if (!url) {
      return sock.sendMessage(jid, {
        text: '🐦 *Usage:* .twitter <Tweet URL>\n\n*Example:* .twitter https://twitter.com/user/status/...\n\n⚠️ _Only tweets with video are supported._',
      }, { quoted: msg });
    }

    if (!isTwitterUrl(url)) {
      return sock.sendMessage(jid, {
        text: '❌ *Invalid URL.* Please provide a valid Twitter or X link.\n\n*Supported:*\n• twitter.com/user/status/...\n• x.com/user/status/...',
      }, { quoted: msg });
    }

    try {
      await sock.sendMessage(jid, {
        text: `⬇️ *Fetching Twitter video...*\n🔗 ${truncate(url, 60)}`,
      }, { quoted: msg });

      const data = await downloadTwitter(url);

      await sock.sendMessage(jid, {
        text: `⬆️ *Uploading video...*\n\n🐦 *${truncate(data.title, 60)}*\n📦 *Quality:* ${data.quality}`,
      }, { quoted: msg });

      await sock.sendMessage(jid, {
        video: { url: data.video },
        mimetype: 'video/mp4',
        caption: `🐦 *${truncate(data.title, 60)}*`,
        fileName: `twitter_${Date.now()}.mp4`,
      }, { quoted: msg });

      logger.info(`[twitter] Sent video: "${data.title}" (${data.quality}) to ${jid}`);
    } catch (err) {
      logger.error(`[twitter] Failed for URL "${url}": ${err.message}`);
      await sock.sendMessage(jid, {
        text: `❌ *Download failed.*\n\nReason: ${err.message}\n\n_Make sure the tweet is public and contains a video._`,
      }, { quoted: msg });
    }
  },
};
