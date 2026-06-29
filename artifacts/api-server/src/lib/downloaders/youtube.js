/**
 * YouTube Downloader — RAHL XMD
 *
 * Search  → youtubei.js (Innertube, WEB client, no player — fast metadata only)
 * Download → Cobalt public API (api.cobalt.tools) — handles YouTube
 *            authentication server-side, no API key required, no PoToken issues.
 */

import { Innertube } from 'youtubei.js';
import axios from 'axios';

// ─── Innertube (search / metadata only) ─────────────────────────────────────

let ytMeta = null;

async function getMetaClient() {
  if (!ytMeta) {
    ytMeta = await Innertube.create({
      generate_session_locally: true,
      retrieve_player: false,
    });
  }
  return ytMeta;
}

// Pre-warm on startup
getMetaClient().catch(() => {});

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function extractVideoId(url) {
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/)([^&?/\s]+)/);
  if (!m) throw new Error('Could not extract video ID from URL.');
  return m[1];
}

// ─── Search & Metadata (youtubei.js) ────────────────────────────────────────

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

// ─── Download via Cobalt API ─────────────────────────────────────────────────
//
// Cobalt (api.cobalt.tools) processes YouTube server-side — it handles
// authentication, bot-detection, and URL signing on their end.
// We just POST the URL and GET back a direct download stream.

const COBALT_API = 'https://api.cobalt.tools/';
const COBALT_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

async function cobaltDownload(videoUrl, mode = 'audio') {
  // Step 1 — ask Cobalt for a download URL
  const body = {
    url: videoUrl,
    downloadMode: mode,          // 'audio' or 'auto' (auto = best video+audio)
    audioFormat: 'mp3',
    audioBitrate: '128',
    filenameStyle: 'basic',
  };

  const res = await axios.post(COBALT_API, body, {
    headers: COBALT_HEADERS,
    timeout: 15_000,
  });

  const { status, url } = res.data || {};

  if (!url || !['tunnel', 'redirect', 'stream'].includes(status)) {
    const reason = res.data?.error?.code || res.data?.text || 'Unknown cobalt error';
    throw new Error(`Cobalt returned no download URL: ${reason}`);
  }

  // Step 2 — stream the audio/video into a buffer
  const fileRes = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 120_000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    maxContentLength: 80 * 1024 * 1024, // 80 MB safety cap
  });

  return Buffer.from(fileRes.data);
}

export async function downloadAudioBuffer(url) {
  if (!isYouTubeUrl(url)) throw new Error('Not a valid YouTube URL.');
  return cobaltDownload(url, 'audio');
}

export async function getBestVideoFormat(url) {
  if (!isYouTubeUrl(url)) throw new Error('Not a valid YouTube URL.');

  // Fetch metadata separately (fast, no auth needed)
  let title = 'Unknown', duration = 'Unknown', channel = 'Unknown';
  try {
    const info = await getYouTubeInfo(url);
    title    = info.title;
    duration = info.duration;
    channel  = info.channel;
  } catch (_) {}

  const buffer = await cobaltDownload(url, 'auto');
  const sizeMB = (buffer.length / 1024 / 1024).toFixed(1);

  if (buffer.length > 60 * 1024 * 1024) {
    throw new Error(`File too large (${sizeMB} MB). WhatsApp limit is ~60 MB.`);
  }

  return { buffer, mimeType: 'video/mp4', quality: '360p', sizeMB, title, duration, channel };
}
