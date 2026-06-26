/**
 * TikTok Downloader Library
 *
 * Purpose: Download TikTok videos/audio using the free tikwm.com public API.
 * No API key required.
 *
 * Exports:
 *   isTikTokUrl(url)       → boolean
 *   downloadTikTok(url)    → { video, audio, title, author, duration, cover }
 *
 * Error handling: Throws descriptive errors on bad URL, API failure, or missing data.
 */

import axios from 'axios';

const TIKTOK_REGEX = /https?:\/\/(www\.|vm\.|vt\.)?tiktok\.com\//;
const API_URL = 'https://tikwm.com/api/';

export function isTikTokUrl(url) {
  return TIKTOK_REGEX.test(url);
}

/**
 * Download TikTok media from a public TikTok URL.
 *
 * @param {string} url - Full TikTok video URL
 * @returns {{ video: string, audio: string, title: string, author: string, duration: number, cover: string }}
 */
export async function downloadTikTok(url) {
  if (!isTikTokUrl(url)) throw new Error('Not a valid TikTok URL.');

  const params = new URLSearchParams({ url, count: 12, cursor: 0, web: 1, hd: 1 });
  const res = await axios.post(API_URL, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 20000,
  });

  const data = res.data?.data;
  if (!data) throw new Error('TikTok API returned no data. The link may be private or expired.');

  return {
    video: data.play || data.hdplay || null,
    audio: data.music || null,
    title: data.title || 'TikTok Video',
    author: data.author?.nickname || 'Unknown',
    duration: data.duration || 0,
    cover: data.cover || null,
    size: data.size || 0,
  };
}
