import NodeCache from 'node-cache';
import { config } from '../config/config.js';
import { logger } from './logger.js';

const cooldownCache = new NodeCache({ stdTTL: config.antiSpam.cooldownSeconds });
const commandCountCache = new NodeCache({ stdTTL: 60 });
const blacklistCache = new NodeCache({ stdTTL: 0 });
const floodCache = new NodeCache({ stdTTL: 10 });

export function isBlacklisted(jid) {
  return blacklistCache.has(jid);
}

export function blacklist(jid) {
  blacklistCache.set(jid, true);
  logger.warn(`Blacklisted: ${jid}`);
}

export function unblacklist(jid) {
  blacklistCache.del(jid);
}

export function isOnCooldown(jid, command) {
  const key = `${jid}:${command}`;
  return cooldownCache.has(key);
}

export function setCooldown(jid, command, seconds = null) {
  const key = `${jid}:${command}`;
  const ttl = seconds || config.antiSpam.cooldownSeconds;
  cooldownCache.set(key, true, ttl);
}

export function getCooldownRemaining(jid, command) {
  const key = `${jid}:${command}`;
  const ttl = cooldownCache.getTtl(key);
  if (!ttl) return 0;
  return Math.ceil((ttl - Date.now()) / 1000);
}

export function checkFlood(jid) {
  const count = floodCache.get(jid) || 0;
  floodCache.set(jid, count + 1, 10);
  return count + 1 > config.antiSpam.floodThreshold;
}

export function checkRateLimit(jid) {
  const count = commandCountCache.get(jid) || 0;
  commandCountCache.set(jid, count + 1);
  return count + 1 > config.antiSpam.maxCommandsPerMinute;
}

export function resetRateLimit(jid) {
  commandCountCache.del(jid);
}

export function getCommandCount(jid) {
  return commandCountCache.get(jid) || 0;
}
