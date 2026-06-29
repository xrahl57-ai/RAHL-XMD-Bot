/**
 * YouTube Downloader — RAHL XMD
 *
 * Uses youtubei.js (Innertube) — YouTube's own internal API.
 * generate_session_locally:true avoids calling YouTube for session setup,
 * bypassing bot-detection / "sign in" errors on headless servers.
 */

import { Innertube } from 'youtubei.js';

let yt = null;

export async function getClient() {
  if (!yt) {
    yt = await Innertube.create({ generate_session_locally: true });
  }
  return yt;
}

// Pre-warm the client so the first command isn't slow
getClient().catch(() => {});

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

export async function searchYouTube(query) {
  const client = await getClient();
  const search = await client.search(query, { type: 'video' });
  const videos = search.videos;
  if (!videos || videos.length === 0) throw new Error('No results found for: ' + query);
  const v = videos[0];
  const id = v.id || v.video_id;
  return {
    id,
    url: `https://www.youtube.com/watch?v=${id}`,
    title: v.title?.text || v.title || 'Unknown',
    duration: v.duration?.text || formatDuration(v.duration?.seconds),
    durationSeconds: v.duration?.seconds || 0,
    thumbnail: v.best_thumbnail?.url || v.thumbnails?.[0]?.url || '',
    views: v.short_view_count?.text || v.view_count?.text || '0',
    channel: v.author?.name || 'Unknown',
  };
}

export async function getYouTubeInfo(url) {
  if (!isYouTubeUrl(url)) throw new Error('Not a valid YouTube URL.');
  const client = await getClient();
  const idMatch = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  if (!idMatch) throw new Error('Could not extract video ID from URL.');
  const videoId = idMatch[1];
  const info = await client.getBasicInfo(videoId);
  const details = info.basic_info;
  return {
    id: videoId,
    url,
    title: details.title || 'Unknown',
    duration: formatDuration(details.duration),
    durationSeconds: details.duration || 0,
    thumbnail: details.thumbnail?.[0]?.url || '',
    channel: details.author || 'Unknown',
    views: formatViews(details.view_count),
  };
}

async function streamToBuffer(readableStream) {
  const chunks = [];
  const reader = readableStream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks);
}

export async function downloadAudioBuffer(url) {
  const client = await getClient();
  const idMatch = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  if (!idMatch) throw new Error('Could not extract video ID from URL.');
  const videoId = idMatch[1];
  const stream = await client.download(videoId, { type: 'audio', quality: 'best', format: 'mp4' });
  return streamToBuffer(stream);
}

export async function getBestVideoFormat(url) {
  const client = await getClient();
  const idMatch = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  if (!idMatch) throw new Error('Could not extract video ID from URL.');
  const videoId = idMatch[1];

  const info = await client.getBasicInfo(videoId);
  const details = info.basic_info;

  const stream = await client.download(videoId, {
    type: 'video+audio',
    quality: '360p',
    format: 'mp4',
  });
  const buffer = await streamToBuffer(stream);

  const sizeMB = (buffer.length / 1024 / 1024).toFixed(1);
  if (buffer.length > 60 * 1024 * 1024) {
    throw new Error(`File too large (${sizeMB} MB). WhatsApp limit is ~60 MB.`);
  }

  return {
    buffer,
    mimeType: 'video/mp4',
    quality: '360p',
    sizeMB,
    title: details.title || 'Unknown',
    duration: formatDuration(details.duration),
    channel: details.author || 'Unknown',
  };
}
