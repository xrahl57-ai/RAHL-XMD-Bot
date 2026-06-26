/**
 * Message Cache — RAHL XMD Security Engine
 *
 * In-memory cache storing recent messages per chat for anti-delete recovery.
 * TTL: 10 minutes per message. Max 300 entries total to protect memory.
 *
 * Structure per entry:
 *   { msg, buffer, type, sender, pushName, timestamp, jid }
 */

const cache = new Map();
const TTL_MS = 10 * 60 * 1000;
const MAX_TOTAL = 300;

function evictExpired() {
  const now = Date.now();
  for (const [id, entry] of cache) {
    if (now - entry.timestamp > TTL_MS) cache.delete(id);
  }
}

function evictOldest() {
  if (cache.size < MAX_TOTAL) return;
  const oldest = [...cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp);
  for (let i = 0; i < 30; i++) cache.delete(oldest[i][0]);
}

export function storeMessage(id, entry) {
  evictExpired();
  evictOldest();
  cache.set(id, { ...entry, timestamp: Date.now() });
}

export function getStoredMessage(id) {
  const entry = cache.get(id);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > TTL_MS) { cache.delete(id); return null; }
  return entry;
}

export function deleteStoredMessage(id) {
  cache.delete(id);
}

export function getCacheSize() {
  return cache.size;
}
