/**
 * YouTube Downloader Library
 *
 * Purpose: Search YouTube and download audio/video streams using @distube/ytdl-core.
 * No API key required. Wraps ytdl-core with metadata extraction and format selection.
 *
 * Exports:
 *   searchYouTube(query)         → first matching video info
 *   getYouTubeInfo(url)          → full video metadata
 *   downloadAudioBuffer(url)     → audio as Buffer (for WhatsApp sendMessage)
 *   getBestVideoFormat(url)      → { url, mimeType, quality, size } for ≤360p mp4
 *
 * Error handling: All functions throw descriptive errors. Callers must catch.
 */

import ytdl from '@distube/ytdl-core';
import YouTube from 'youtube-sr';

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
  const results = await YouTube.search(query, { limit: 1, type: 'video' });
  if (!results || results.length === 0) throw new Error('No results found for: ' + query);
  const v = results[0];
  return {
    id: v.id,
    url: `https://www.youtube.com/watch?v=${v.id}`,
    title: v.title || 'Unknown',
    duration: v.duration ? formatDuration(Math.floor(v.duration / 1000)) : 'Unknown',
    durationMs: v.duration || 0,
    thumbnail: v.thumbnail?.url || '',
    views: formatViews(v.views),
    channel: v.channel?.name || 'Unknown',
  };
}

/**
 * Get full metadata for a YouTube URL.
 * Returns { title, duration, thumbnail, channel, views, url }.
 */
export async function getYouTubeInfo(url) {
  if (!isYouTubeUrl(url)) throw new Error('Not a valid YouTube URL.');
  const info = await ytdl.getInfo(url);
  const details = info.videoDetails;
  return {
    title: details.title || 'Unknown',
    duration: formatDuration(parseInt(details.lengthSeconds, 10)),
    durationSeconds: parseInt(details.lengthSeconds, 10),
    thumbnail: details.thumbnails?.slice(-1)[0]?.url || '',
    channel: details.author?.name || 'Unknown',
    views: formatViews(parseInt(details.viewCount, 10)),
    url,
    info,
  };
}

/**
 * Download YouTube audio and return a Buffer.
 * Selects highest quality audio-only format.
 * Suitable for songs ≤ ~15 minutes. Larger files may exceed WhatsApp limits.
 */
export async function downloadAudioBuffer(url) {
  const info = await ytdl.getInfo(url);
  const format = ytdl.chooseFormat(info.formats, {
    quality: 'highestaudio',
    filter: 'audioonly',
  });
  if (!format) throw new Error('No audio format available for this video.');

  const stream = ytdl.downloadFromInfo(info, { format });
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

/**
 * Get the best video download URL (≤360p mp4, audio+video).
 * Returns { url, mimeType, quality, contentLength } for direct streaming to WhatsApp.
 */
export async function getBestVideoFormat(url) {
  const info = await ytdl.getInfo(url);
  const preferred = ['360p', '240p', '144p'];

  let format = null;
  for (const q of preferred) {
    format = info.formats.find(
      (f) => f.qualityLabel === q && f.hasAudio && f.hasVideo && f.container === 'mp4',
    );
    if (format) break;
  }

  if (!format) {
    format = info.formats
      .filter((f) => f.hasAudio && f.hasVideo && f.container === 'mp4')
      .sort((a, b) => (a.contentLength || 0) - (b.contentLength || 0))[0];
  }

  if (!format) throw new Error('No suitable video format found. Try a shorter video.');

  const sizeBytes = parseInt(format.contentLength || 0, 10);
  const sizeMB = (sizeBytes / 1024 / 1024).toFixed(1);
  if (sizeBytes > 60 * 1024 * 1024) {
    throw new Error(`Video is too large (${sizeMB} MB). WhatsApp limit is ~60 MB. Try a shorter clip.`);
  }

  return {
    url: format.url,
    mimeType: format.mimeType?.split(';')[0] || 'video/mp4',
    quality: format.qualityLabel || 'SD',
    contentLength: sizeBytes,
    sizeMB,
    title: info.videoDetails.title,
    duration: formatDuration(parseInt(info.videoDetails.lengthSeconds, 10)),
    channel: info.videoDetails.author?.name || 'Unknown',
  };
}
