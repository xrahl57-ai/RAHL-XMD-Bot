/**
 * MediaFire Downloader Library
 *
 * Purpose: Extract direct download links from public MediaFire file pages
 * by scraping the page HTML. No API key required.
 *
 * Exports:
 *   isMediaFireUrl(url)       → boolean
 *   downloadMediaFire(url)    → { downloadUrl: string, filename: string, size: string }
 *
 * Error handling: Throws on private/deleted files or unexpected page structure.
 */

import axios from 'axios';

const MF_REGEX = /https?:\/\/(www\.)?mediafire\.com\/file\//;

export function isMediaFireUrl(url) {
  return MF_REGEX.test(url);
}

/**
 * Extract a direct download URL from a public MediaFire file page.
 *
 * @param {string} url - Public MediaFire file URL
 * @returns {{ downloadUrl: string, filename: string, size: string }}
 */
export async function downloadMediaFire(url) {
  if (!isMediaFireUrl(url)) throw new Error('Not a valid MediaFire file URL (must contain /file/).');

  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    timeout: 20000,
  });

  const html = res.data || '';

  const downloadMatch =
    html.match(/href="(https:\/\/download\d*\.mediafire\.com\/[^"]+)"/) ||
    html.match(/id="downloadButton"[^>]*href="([^"]+)"/) ||
    html.match(/class="[^"]*download[^"]*"[^>]*href="(https:\/\/[^"]+)"/i);

  if (!downloadMatch) {
    throw new Error('Could not find download link. The file may be deleted, private, or require login.');
  }

  const filenameMatch = html.match(/<div[^>]*class="[^"]*filename[^"]*"[^>]*>([^<]+)<\/div>/i)
    || html.match(/aria-label="([^"]+\.\w{2,5})"/i)
    || html.match(/<title>Download ([^<|]+)/i);

  const sizeMatch = html.match(/(\d+(?:\.\d+)?\s?(?:KB|MB|GB))/i);

  return {
    downloadUrl: downloadMatch[1],
    filename: filenameMatch?.[1]?.trim() || 'mediafire_file',
    size: sizeMatch?.[1] || 'Unknown size',
  };
}
