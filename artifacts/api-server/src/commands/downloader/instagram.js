/**
 * .instagram <URL>
 * Downloads public Instagram posts, reels, and videos.
 */

import { isInstagramUrl, downloadInstagram } from '../../lib/downloaders/instagram.js';
import { logger } from '../../utils/logger.js';
import { truncate } from '../../utils/helpers.js';

export default {
  name: 'instagram',
  aliases: ['ig', 'insta', 'igdl'],
  description: 'Download Instagram post/reel/video',
  category: 'downloader',
  usage: '.instagram <Instagram URL>',
  cooldown: 20,

  async execute({ sock, msg, jid, fullArgs }) {
    const url = fullArgs.trim();

    if (!url) {
      return sock.sendMessage(jid, {
        text: '📸 *Usage:* .instagram <Instagram URL>\n\n*Supported:*\n• instagram.com/p/...\n• instagram.com/reel/...\n• instagram.com/tv/...\n\n⚠️ _Only public content is supported._',
      }, { quoted: msg });
    }

    if (!isInstagramUrl(url)) {
      return sock.sendMessage(jid, {
        text: '❌ *Invalid URL.* Please provide a valid Instagram post, reel, or video link.',
      }, { quoted: msg });
    }

    try {
      await sock.sendMessage(jid, {
        text: `⬇️ *Fetching Instagram media...*\n🔗 ${truncate(url, 60)}`,
      }, { quoted: msg });

      const data = await downloadInstagram(url);
      const item = data.media[0];

      await sock.sendMessage(jid, {
        text: `⬆️ *Uploading...*\n📦 *Type:* ${item.type} | *Items found:* ${data.media.length}`,
      }, { quoted: msg });

      if (item.type === 'video') {
        await sock.sendMessage(jid, {
          video: { url: item.url },
          mimetype: 'video/mp4',
          caption: data.caption ? truncate(data.caption, 200) : '📸 Downloaded via RAHL XMD',
          fileName: `instagram_${Date.now()}.mp4`,
        }, { quoted: msg });
      } else {
        await sock.sendMessage(jid, {
          image: { url: item.url },
          caption: data.caption ? truncate(data.caption, 200) : '📸 Downloaded via RAHL XMD',
        }, { quoted: msg });
      }

      if (data.media.length > 1) {
        await sock.sendMessage(jid, {
          text: `ℹ️ _This post has ${data.media.length} items. Only the first was sent._`,
        }, { quoted: msg });
      }

      logger.info(`[instagram] Sent ${item.type} to ${jid}`);
    } catch (err) {
      logger.error(`[instagram] Failed for URL "${url}": ${err.message}`);
      await sock.sendMessage(jid, {
        text: `❌ *Download failed.*\n\nReason: ${err.message}\n\n_Make sure the content is public and the URL is correct._`,
      }, { quoted: msg });
    }
  },
};
