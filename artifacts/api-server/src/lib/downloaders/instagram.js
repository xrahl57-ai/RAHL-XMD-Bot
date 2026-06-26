/**
 * Instagram Downloader Library
 *
 * Purpose: Download public Instagram media (posts, reels) using the
 * instafinsta.com public API. No API key required.
 *
 * Exports:
 *   isInstagramUrl(url)       → boolean
 *   downloadInstagram(url)    → { media: [{ url, type }], caption }
 *
 * Error handling: Throws on private content, expired links, or API failure.
 */

import axios from 'axios';

const IG_REGEX = /https?:\/\/(www\.)?instagram\.com\/(p|reel|reels|tv)\//;

export function isInstagramUrl(url) {
  return IG_REGEX.test(url);
}

/**
 * Download media from a public Instagram post or reel.
 *
 * @param {string} url - Public Instagram post/reel URL
 * @returns {{ media: Array<{ url: string, type: 'video'|'image' }>, caption: string }}
 */
export async function downloadInstagram(url) {
  if (!isInstagramUrl(url)) throw new Error('Not a valid Instagram post/reel URL.');

  const encoded = encodeURIComponent(url);
  const apiUrl = `https://instafinsta.com/wp-json/aio-dl/video-data/?url=${encoded}`;

  const res = await axios.get(apiUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    timeout: 20000,
  });

  const data = res.data;
  if (!data || (!data.medias && !data.url)) {
    throw new Error('Could not retrieve Instagram media. The content may be private.');
  }

  const media = [];

  if (data.medias && Array.isArray(data.medias)) {
    for (const item of data.medias) {
      if (item.url) {
        media.push({ url: item.url, type: item.type?.includes('video') ? 'video' : 'image' });
      }
    }
  } else if (data.url) {
    media.push({ url: data.url, type: 'video' });
  }

  if (media.length === 0) throw new Error('No downloadable media found in this Instagram post.');

  return {
    media,
    caption: data.title || data.caption || '',
  };
}
