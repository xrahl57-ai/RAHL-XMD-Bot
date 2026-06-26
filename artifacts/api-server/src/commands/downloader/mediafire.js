/**
 * .mediafire <URL>
 * Extracts a direct download link from a public MediaFire file and sends it.
 */

import { isMediaFireUrl, downloadMediaFire } from '../../lib/downloaders/mediafire.js';
import { logger } from '../../utils/logger.js';
import { truncate } from '../../utils/helpers.js';

export default {
  name: 'mediafire',
  aliases: ['mf', 'mfdl'],
  description: 'Get direct download link from MediaFire',
  category: 'downloader',
  usage: '.mediafire <MediaFire URL>',
  cooldown: 15,

  async execute({ sock, msg, jid, fullArgs }) {
    const url = fullArgs.trim();

    if (!url) {
      return sock.sendMessage(jid, {
        text: '📁 *Usage:* .mediafire <MediaFire URL>\n\n*Example:* .mediafire https://www.mediafire.com/file/xxx/filename\n\n⚠️ _Only public files are supported._',
      }, { quoted: msg });
    }

    if (!isMediaFireUrl(url)) {
      return sock.sendMessage(jid, {
        text: '❌ *Invalid URL.* Please provide a valid MediaFire file link.\n\n*Must contain:* mediafire.com/file/',
      }, { quoted: msg });
    }

    try {
      await sock.sendMessage(jid, {
        text: `⬇️ *Fetching MediaFire file info...*\n🔗 ${truncate(url, 60)}`,
      }, { quoted: msg });

      const data = await downloadMediaFire(url);

      await sock.sendMessage(jid, {
        text: `✅ *File Ready!*\n\n📁 *Filename:* ${data.filename}\n📦 *Size:* ${data.size}\n\n🔗 *Download Link:*\n${data.downloadUrl}\n\n_Link valid for a limited time. Download quickly._`,
      }, { quoted: msg });

      logger.info(`[mediafire] Sent link: "${data.filename}" (${data.size}) to ${jid}`);
    } catch (err) {
      logger.error(`[mediafire] Failed for URL "${url}": ${err.message}`);
      await sock.sendMessage(jid, {
        text: `❌ *Failed to fetch file.*\n\nReason: ${err.message}\n\n_Make sure the file is public and the link is correct._`,
      }, { quoted: msg });
    }
  },
};
