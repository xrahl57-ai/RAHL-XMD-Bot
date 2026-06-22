import { logger } from './logger.js';

export function validateSession(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') return false;
  const trimmed = sessionId.trim();
  if (trimmed.length < 20) return false;
  try {
    const decoded = Buffer.from(trimmed, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);
    return parsed && typeof parsed === 'object';
  } catch {
    return false;
  }
}

export function decodeSession(sessionId) {
  try {
    const trimmed = sessionId.trim();
    const decoded = Buffer.from(trimmed, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (err) {
    logger.error('Failed to decode session:', err.message);
    return null;
  }
}

export function buildAuthState(sessionData) {
  try {
    const creds = sessionData.creds || sessionData;
    return {
      creds,
      keys: sessionData.keys || {},
    };
  } catch (err) {
    logger.error('Failed to build auth state:', err.message);
    return null;
  }
}

export function maskSession(sessionId) {
  if (!sessionId) return '[EMPTY]';
  const len = sessionId.length;
  return sessionId.substring(0, 6) + '****' + sessionId.substring(len - 4);
}
