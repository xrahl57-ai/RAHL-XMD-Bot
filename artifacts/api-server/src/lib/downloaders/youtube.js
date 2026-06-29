/**
 * YouTube Downloader — RAHL XMD
 *
 * Search/Metadata  → youtubei.js (WEB client, no player, fast)
 * Audio/Video DL   → YouTube InnerTube API (ANDROID client) called directly via axios.
 *
 * Why InnerTube directly?
 *   The YouTube Android app sends a specific clientName/clientVersion to YouTube's
 *   own internal API endpoint. YouTube responds with plain (unsigned) HTTPS stream
 *   URLs for the Android client — no PoToken, no signature cipher, no login needed.
 *   This is the same thing the official YouTube app does on every Android phone.
 *   No third-party service is involved, so it can't "change its API" on us.
 */

import { Innertube } from 'youtubei.js';
import axios from 'axios';

// ─── Innertube (search + metadata only) ──────────────────────────────────────

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

getMetaClient().catch(() => {}); // pre-warm on startup

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

// ─── Search (youtubei.js — reliable, no player needed) ───────────────────────

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

// ─── InnerTube ANDROID client (direct YouTube API) ───────────────────────────
//
// YouTube's InnerTube API is what the official apps use internally.
// The ANDROID client (clientName "3") returns plain unsigned HTTPS URLs
// in streaming_data.adaptive_formats — no cipher, no auth, no PoToken.
// This works from any IP (server, VPS, etc.) the same way it works on a phone.

const INNERTUBE_URL = 'https://www.youtube.com/youtubei/v1/player';

// These are the same values hard-coded inside the YouTube Android APK
const ANDROID_CONTEXT = {
  client: {
    clientName: 'ANDROID',
    clientVersion: '19.09.37',
    androidSdkVersion: 30,
    userAgent: 'com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip',
    hl: 'en',
    timeZone: 'UTC',
    utcOffsetMinutes: 0,
  },
};

async function fetchInnerTubePlayerData(videoId) {
  const res = await axios.post(
    INNERTUBE_URL,
    { videoId, context: ANDROID_CONTEXT },
    {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': ANDROID_CONTEXT.client.userAgent,
        'X-YouTube-Client-Name': '3',
        'X-YouTube-Client-Version': ANDROID_CONTEXT.client.clientVersion,
        'Origin': 'https://www.youtube.com',
        'Referer': `https://www.youtube.com/watch?v=${videoId}`,
      },
      timeout: 20_000,
    },
  );

  const data = res.data;
  const status = data?.playabilityStatus?.status;

  if (status === 'LOGIN_REQUIRED') throw new Error('This video is age-restricted or private.');
  if (status === 'ERROR' || status === 'UNPLAYABLE') {
    throw new Error(data.playabilityStatus?.reason || 'Video is not available.');
  }
  if (!data.streamingData) throw new Error('YouTube returned no streaming data for this video.');

  return data;
}

async function downloadFromFormat(format) {
  if (!format.url) {
    // Some formats have a signatureCipher instead of a plain url — ANDROID usually doesn't but just in case
    throw new Error('Stream URL requires deciphering — video not downloadable this way.');
  }

  const res = await axios.get(format.url, {
    responseType: 'arraybuffer',
    timeout: 120_000,
    maxContentLength: 80 * 1024 * 1024, // 80 MB safety cap
    headers: {
      'User-Agent': ANDROID_CONTEXT.client.userAgent,
      'Referer': 'https://www.youtube.com/',
    },
  });

  return Buffer.from(res.data);
}

// ─── Public download API ──────────────────────────────────────────────────────

export async function downloadAudioBuffer(url) {
  const videoId = extractVideoId(url);
  const data = await fetchInnerTubePlayerData(videoId);

  const adaptiveFormats = data.streamingData.adaptiveFormats || [];

  // Prefer AAC (audio/mp4) for maximum WhatsApp compatibility
  const audioPriority = ['audio/mp4', 'audio/webm'];
  let bestAudio = null;

  for (const mimePrefix of audioPriority) {
    const candidates = adaptiveFormats
      .filter(f => f.mimeType?.startsWith(mimePrefix) && f.url)
      .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
    if (candidates.length > 0) { bestAudio = candidates[0]; break; }
  }

  if (!bestAudio) throw new Error('No downloadable audio stream found in this video.');
  return downloadFromFormat(bestAudio);
}

export async function getBestVideoFormat(url) {
  const videoId = extractVideoId(url);

  // Fetch metadata (title, duration, channel)
  let title = 'Unknown', duration = 'Unknown', channel = 'Unknown';
  try {
    const info = await getYouTubeInfo(url);
    title    = info.title;
    duration = info.duration;
    channel  = info.channel;
  } catch (_) {}

  const data = await fetchInnerTubePlayerData(videoId);

  // Combined formats (video+audio in one stream) — easiest for WhatsApp
  const formats = data.streamingData.formats || [];
  const combined = formats
    .filter(f => f.mimeType?.startsWith('video/mp4') && f.url)
    .sort((a, b) => {
      // Prefer lower resolution to keep under 60 MB
      const qa = parseInt(a.qualityLabel) || 9999;
      const qb = parseInt(b.qualityLabel) || 9999;
      return qa - qb;
    });

  if (combined.length === 0) throw new Error('No combined video+audio stream found. Try .ytmp3 instead.');

  // Pick ≤360p if available, otherwise lowest available
  const target = combined.find(f => parseInt(f.qualityLabel) <= 360) || combined[0];

  const buffer = await downloadFromFormat(target);
  const sizeMB = (buffer.length / 1024 / 1024).toFixed(1);

  if (buffer.length > 60 * 1024 * 1024) {
    throw new Error(`File too large (${sizeMB} MB). WhatsApp limit is ~60 MB. Try a shorter video.`);
  }

  return {
    buffer,
    mimeType: 'video/mp4',
    quality: target.qualityLabel || '360p',
    sizeMB,
    title,
    duration,
    channel,
  };
}
