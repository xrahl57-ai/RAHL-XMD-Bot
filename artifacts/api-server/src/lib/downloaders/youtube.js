/**
 * YouTube Downloader — RAHL XMD
 *
 * Uses youtubei.js (Innertube) — YouTube's own internal API.
 *
 * Two separate clients are used:
 *   - META client  (WEB, no player): fast search and metadata only
 *   - DL client    (ANDROID): downloads — Android client bypasses
 *     PoToken/bot-detection "LOGIN_REQUIRED" errors on server IPs
 *     because Android uses OAuth rather than browser-session signing.
 */

import { Innertube } from 'youtubei.js';

let ytMeta = null;   // search + info
let ytDl   = null;   // downloads

async function getMetaClient() {
  if (!ytMeta) {
    ytMeta = await Innertube.create({
      generate_session_locally: true,
      retrieve_player: false,
    });
  }
  return ytMeta;
}

async function getDownloadClient() {
  if (!ytDl) {
    // 'ANDROID' client does not require signed URLs or PoToken,
    // so it works on datacenter / server IPs without "LOGIN_REQUIRED".
    ytDl = await Innertube.create({
      generate_session_locally: true,
      client_type: 'ANDROID',
    });
  }
  return ytDl;
}

// Pre-warm both clients so the first command is fast
Promise.all([getMetaClient(), getDownloadClient()]).catch(() => {});

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
  const client = await getMetaClient();
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

function extractVideoId(url) {
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/)([^&?/]+)/);
  if (!m) throw new Error('Could not extract video ID from URL.');
  return m[1];
}

export async function getYouTubeInfo(url) {
  if (!isYouTubeUrl(url)) throw new Error('Not a valid YouTube URL.');
  const client = await getMetaClient();
  const videoId = extractVideoId(url);
  const info = await client.getBasicInfo(videoId);
  const d = info.basic_info;
  return {
    id: videoId,
    url,
    title: d.title || 'Unknown',
    duration: formatDuration(d.duration),
    durationSeconds: d.duration || 0,
    thumbnail: d.thumbnail?.[0]?.url || '',
    channel: d.author || 'Unknown',
    views: formatViews(d.view_count),
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
  const videoId = extractVideoId(url);
  const client = await getDownloadClient();

  // Try ANDROID download first
  try {
    const stream = await client.download(videoId, {
      type: 'audio',
      quality: 'best',
      format: 'mp4',
    });
    return await streamToBuffer(stream);
  } catch (err) {
    // If ANDROID client fails too, surface a helpful error
    throw new Error(`YouTube blocked this download: ${err.message}. Try .ytmp3 <url> with a direct link.`);
  }
}

export async function getBestVideoFormat(url) {
  const videoId = extractVideoId(url);

  // Get title/channel from metadata client
  const metaClient = await getMetaClient();
  let title = 'Unknown', duration = 'Unknown', channel = 'Unknown';
  try {
    const info = await metaClient.getBasicInfo(videoId);
    const d = info.basic_info;
    title    = d.title  || 'Unknown';
    duration = formatDuration(d.duration);
    channel  = d.author || 'Unknown';
  } catch (_) {}

  // Download using Android client
  const dlClient = await getDownloadClient();
  try {
    const stream = await dlClient.download(videoId, {
      type: 'video+audio',
      quality: '360p',
      format: 'mp4',
    });
    const buffer = await streamToBuffer(stream);
    const sizeMB = (buffer.length / 1024 / 1024).toFixed(1);
    if (buffer.length > 60 * 1024 * 1024) {
      throw new Error(`File too large (${sizeMB} MB). WhatsApp limit is ~60 MB.`);
    }
    return { buffer, mimeType: 'video/mp4', quality: '360p', sizeMB, title, duration, channel };
  } catch (err) {
    throw new Error(`YouTube blocked this download: ${err.message}`);
  }
}
