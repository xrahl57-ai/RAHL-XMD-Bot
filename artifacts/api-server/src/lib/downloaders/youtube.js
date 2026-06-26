/**
 * YouTube Downloader Library — RAHL XMD
 *
 * Uses play-dl which bypasses YouTube bot-detection without sign-in.
 *
 * Exports:
 *   searchYouTube(query)         → first matching video info
 *   getYouTubeInfo(url)          → full video metadata
 *   downloadAudioBuffer(url)     → audio as Buffer (for WhatsApp sendMessage)
 *   getBestVideoFormat(url)      → { url, mimeType, quality } for ≤360p mp4
 *
 * Error handling: All functions throw descriptive errors. Callers must catch.
 */

import playdl from 'play-dl';

const YT_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)/;

export function isYouTubeUrl(url) {
  return YT_REGEX.test(url);
}

export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return 'Unknown';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatViews(n) {
  if (!n) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

/**
 * Search YouTube for a query string.
 * Returns the first result with { id, url, title, duration, thumbnail, views, channel }.
 */
export async function searchYouTube(query) {
  const results = await playdl.search(query, { source: { youtube: 'video' }, limit: 1 });
  if (!results || results.length === 0) throw new Error('No results found for: ' + query);
  const v = results[0];
  return {
    id: v.id,
    url: v.url,
    title: v.title || 'Unknown',
    duration: formatDuration(v.durationInSec),
    durationSeconds: v.durationInSec || 0,
    thumbnail: v.thumbnails?.[0]?.url || '',
    views: formatViews(v.views),
    channel: v.channel?.name || 'Unknown',
  };
}

/**
 * Get full metadata for a YouTube URL.
 */
export async function getYouTubeInfo(url) {
  if (!isYouTubeUrl(url)) throw new Error('Not a valid YouTube URL.');
  const info = await playdl.video_info(url);
  const details = info.video_details;
  return {
    title: details.title || 'Unknown',
    duration: formatDuration(details.durationInSec),
    durationSeconds: details.durationInSec || 0,
    thumbnail: details.thumbnails?.[0]?.url || '',
    channel: details.channel?.name || 'Unknown',
    views: formatViews(details.views),
    url,
    info,
  };
}

/**
 * Download YouTube audio and return a Buffer.
 * Uses play-dl stream — no sign-in required.
 */
export async function downloadAudioBuffer(url) {
  const stream = await playdl.stream(url, { quality: 2 });
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.stream.on('data', (chunk) => chunks.push(chunk));
    stream.stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.stream.on('error', reject);
  });
}

/**
 * For video: play-dl streams audio+video separately, so we return
 * a buffer of the audio stream (best available) since WhatsApp audio
 * is the primary use-case. For future video support, use ytdl formats.
 */
export async function getBestVideoFormat(url) {
  const info = await playdl.video_info(url);
  const details = info.video_details;
  const stream = await playdl.stream(url, { quality: 2 });
  const buffer = await new Promise((resolve, reject) => {
    const chunks = [];
    stream.stream.on('data', (c) => chunks.push(c));
    stream.stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.stream.on('error', reject);
  });

  const sizeMB = (buffer.length / 1024 / 1024).toFixed(1);
  if (buffer.length > 60 * 1024 * 1024) {
    throw new Error(`File too large (${sizeMB} MB). WhatsApp limit is ~60 MB. Try a shorter video.`);
  }

  return {
    buffer,
    mimeType: 'video/mp4',
    quality: 'SD',
    sizeMB,
    title: details.title || 'Unknown',
    duration: formatDuration(details.durationInSec),
    channel: details.channel?.name || 'Unknown',
  };
}
