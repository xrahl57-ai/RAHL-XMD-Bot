/**
 * Twitter / X Downloader Library
 *
 * Purpose: Download public Twitter/X videos using the twitsave.com public API.
 * No API key required. Only works on public tweets with video content.
 *
 * Exports:
 *   isTwitterUrl(url)       → boolean
 *   downloadTwitter(url)    → { video: string, thumbnail: string, title: string, quality: string }
 *
 * Error handling: Throws on private/unsupported tweets or API failure.
 */

import axios from 'axios';

const TWITTER_REGEX = /https?:\/\/(www\.)?(twitter\.com|x\.com)\//;

export function isTwitterUrl(url) {
  return TWITTER_REGEX.test(url);
}

/**
 * Download a public Twitter/X video.
 *
 * @param {string} url - Public tweet URL containing video
 * @returns {{ video: string, thumbnail: string, title: string, quality: string }}
 */
export async function downloadTwitter(url) {
  if (!isTwitterUrl(url)) throw new Error('Not a valid Twitter/X URL.');

  const apiUrl = `https://twitsave.com/info?url=${encodeURIComponent(url)}`;
  const res = await axios.get(apiUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    timeout: 20000,
  });

  const html = res.data || '';

  const videoMatches = [...html.matchAll(/href="(https:\/\/video\.twimg\.com[^"]+)"/g)];
  const thumbMatch = html.match(/src="(https:\/\/pbs\.twimg\.com\/[^"]+)"/);
  const titleMatch = html.match(/<p[^>]*class="[^"]*leading-normal[^"]*"[^>]*>([^<]+)<\/p>/i);

  if (!videoMatches || videoMatches.length === 0) {
    throw new Error('No video found in this tweet. The tweet may be text-only or private.');
  }

  const bestVideo = videoMatches[0][1];
  const quality = bestVideo.includes('2048x') ? 'HD' : bestVideo.includes('1280x') ? 'HD' : 'SD';

  return {
    video: bestVideo,
    thumbnail: thumbMatch?.[1] || null,
    title: titleMatch?.[1]?.trim() || 'Twitter Video',
    quality,
  };
}
