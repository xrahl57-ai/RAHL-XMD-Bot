import moment from 'moment';

export function formatUptime(startTime) {
  const diff = Date.now() - startTime;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getJidNumber(jid) {
  return jid?.split('@')[0] || '';
}

export function isGroup(jid) {
  return jid?.endsWith('@g.us') || false;
}

export function normalizeNumber(number) {
  return number.replace(/[^0-9]/g, '');
}

export function buildJid(number) {
  return `${normalizeNumber(number)}@s.whatsapp.net`;
}

export function formatDate(date) {
  return moment(date).format('DD/MM/YYYY HH:mm:ss');
}

export function timeAgo(date) {
  return moment(date).fromNow();
}

export function chunk(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export function truncate(str, length = 100) {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export function isUrl(text) {
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
}

export const BOT_NAME = process.env.BOT_NAME || 'RAHL XMD';
export const OWNER_NAME = process.env.OWNER_NAME || 'LORD RAHL';
export const PREFIX = process.env.PREFIX || '.';
export const FOOTER = process.env.FOOTER || '👑 Powered By LORD RAHL';
