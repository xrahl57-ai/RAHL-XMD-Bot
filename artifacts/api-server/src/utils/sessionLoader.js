import { logger } from './logger.js';

function step(msg) {
  logger.info(msg);
  console.log('\x1b[35m' + msg + '\x1b[0m');
}

function fail(msg) {
  logger.error(msg);
  console.error('\x1b[31m✗ ' + msg + '\x1b[0m');
}

function toStandardBase64(str) {
  return str.replace(/-/g, '+').replace(/_/g, '/');
}

function isUrlSafeBase64(str) {
  return /[-_]/.test(str) && !/[+/]/.test(str);
}

function tryBase64Decode(raw) {
  const standard = toStandardBase64(raw);
  const padded = standard + '='.repeat((4 - (standard.length % 4)) % 4);
  try {
    const decoded = Buffer.from(padded, 'base64').toString('utf-8');
    if (!decoded || decoded.trim() === '') return null;
    return decoded;
  } catch {
    return null;
  }
}

function tryJsonParse(str) {
  try {
    return { ok: true, data: JSON.parse(str) };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function detectSessionLayout(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    return { layout: null, reason: 'Parsed value is not an object' };
  }

  const keys = Object.keys(parsed);

  if (parsed['creds.json'] && typeof parsed['creds.json'] === 'object') {
    return { layout: 'creds.json-keys', keys };
  }

  if (parsed.creds && typeof parsed.creds === 'object') {
    return { layout: 'creds-keys', keys };
  }

  if (parsed.noiseKey || parsed.signedIdentityKey || parsed.registrationId !== undefined) {
    return { layout: 'flat-creds', keys };
  }

  return { layout: 'unknown', keys };
}

function validateCredsObject(creds) {
  const required = ['noiseKey', 'signedIdentityKey', 'signedPreKey', 'registrationId'];
  const missing = required.filter((k) => !(k in creds));
  if (missing.length > 0) {
    return { valid: false, missing };
  }
  return { valid: true };
}

export function decodeAndParseSession(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') {
    fail('SESSION_ID is missing or not a string');
    return null;
  }

  step('✓ SESSION_ID found');

  const cleaned = sessionId.replace(/[\r\n\s]/g, '');
  step(`✓ SESSION_ID length: ${cleaned.length} (whitespace/newlines removed)`);

  if (cleaned.length < 20) {
    fail(`SESSION_ID too short (${cleaned.length} chars) — not a valid session`);
    return null;
  }

  let parsed = null;
  let source = null;

  if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
    step('✓ Detected: plain JSON string (no Base64 encoding)');
    const result = tryJsonParse(cleaned);
    if (result.ok) {
      parsed = result.data;
      source = 'plain-json';
      step('✓ JSON parsed successfully from plain string');
    } else {
      fail(`JSON parse error on plain string: ${result.error}`);
      return null;
    }
  } else {
    const urlSafe = isUrlSafeBase64(cleaned);
    if (urlSafe) {
      step('✓ Base64 format detected: URL-safe (contains - and _)');
    } else {
      step('✓ Base64 format detected: standard');
    }

    const decoded = tryBase64Decode(cleaned);
    if (!decoded) {
      fail('Invalid Base64 — could not decode SESSION_ID');
      return null;
    }
    step('✓ Base64 decoded successfully');

    if (decoded.startsWith('{') || decoded.startsWith('[')) {
      const result = tryJsonParse(decoded);
      if (result.ok) {
        parsed = result.data;
        source = urlSafe ? 'url-safe-base64-json' : 'standard-base64-json';
        step('✓ JSON parsed successfully from Base64-decoded string');
      } else {
        fail(`JSON parse error after Base64 decode: ${result.error}`);
        return null;
      }
    } else {
      const double = tryBase64Decode(decoded.trim());
      if (double && (double.startsWith('{') || double.startsWith('['))) {
        step('✓ Detected double-encoded Base64 — decoding second layer');
        const result = tryJsonParse(double);
        if (result.ok) {
          parsed = result.data;
          source = 'double-base64-json';
          step('✓ JSON parsed successfully from double-decoded string');
        } else {
          fail(`JSON parse error after double Base64 decode: ${result.error}`);
          return null;
        }
      } else {
        fail('Decoded Base64 is not valid JSON and is not double-encoded — unsupported session format');
        return null;
      }
    }
  }

  const { layout, keys, reason } = detectSessionLayout(parsed);

  step(`✓ Root keys detected: ${keys ? keys.map((k) => '\n  - ' + k).join('') : '(none)'}`);

  if (layout === null) {
    fail(`Session structure invalid: ${reason}`);
    return null;
  }

  step(`✓ Session layout identified: ${layout}`);

  let creds = null;
  let sessionKeys = null;

  if (layout === 'creds.json-keys') {
    creds = parsed['creds.json'];
    sessionKeys = parsed.keys || null;
    step('✓ Auth state created from layout: creds.json + keys');
  } else if (layout === 'creds-keys') {
    creds = parsed.creds;
    sessionKeys = parsed.keys || null;
    step('✓ Auth state created from layout: creds + keys');
  } else if (layout === 'flat-creds') {
    creds = parsed;
    sessionKeys = null;
    step('✓ Auth state created from layout: flat creds object');
  } else {
    fail(`Unsupported session layout — root keys: ${keys ? keys.join(', ') : 'none'}`);
    return null;
  }

  const validation = validateCredsObject(creds);
  if (!validation.valid) {
    fail(`Auth state validation failed — missing required fields: ${validation.missing.join(', ')}`);
    return null;
  }

  step('✓ Auth state validated — all required credential fields present');

  return { creds, keys: sessionKeys, layout, source };
}

export function validateSession(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') return false;
  if (sessionId.trim().length < 20) return false;
  try {
    const result = decodeAndParseSession(sessionId);
    return result !== null;
  } catch {
    return false;
  }
}

export function maskSession(sessionId) {
  if (!sessionId) return '[EMPTY]';
  const len = sessionId.length;
  return sessionId.substring(0, 6) + '****' + sessionId.substring(len - 4);
}

export function decodeSession(sessionId) {
  const result = decodeAndParseSession(sessionId);
  if (!result) return null;
  return result;
}
