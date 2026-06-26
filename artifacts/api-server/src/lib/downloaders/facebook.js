/**
 * Facebook Downloader Library
 *
 * Purpose: Download public Facebook videos using the fdown.net public API.
 * No API key required. Only works on public (non-private) Facebook videos.
 *
 * Exports:
 *   isFacebookUrl(url)       → boolean
 *   downloadFacebook(url)    → { sd: string, hd: string|null, title: string }
 *
 * Error handling: Throws on private content, unsupported URL, or API failure.
 */

import axios from 'axios';

const FB_REGEX = /https?:\/\/(www\.|m\.|web\.)?(facebook\.com|fb\.watch)\//;

export function isFacebookUrl(url) {
  return FB_REGEX.test(url);
}

/**
 * Download a public Facebook video.
 *
 * @param {string} url - Public Facebook video URL
 * @returns {{ sd: string, hd: string|null, title: string }}
 */
export async function downloadFacebook(url) {
  if (!isFacebookUrl(url)) throw new Error('Not a valid Facebook video URL.');

  const params = new URLSearchParams({ URLz: url });
  const res = await axios.post('https://fdown.net/download.php', params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Referer: 'https://fdown.net/',
    },
    timeout: 20000,
  });

  const html = res.data || '';

  const sdMatch = html.match(/href="(https:\/\/[^"]+)"[^>]*>\s*Normal Quality/i);
  const hdMatch = html.match(/href="(https:\/\/[^"]+)"[^>]*>\s*HD Quality/i);
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

  const sd = sdMatch?.[1] || null;
  const hd = hdMatch?.[1] || null;

  if (!sd && !hd) {
    throw new Error('Could not extract video. The video may be private or in an unsupported format.');
  }

  return {
    sd,
    hd,
    title: titleMatch?.[1]?.replace(/ - fdown\.net.*$/i, '').trim() || 'Facebook Video',
  };
}
