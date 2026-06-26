import { writeFileSync } from 'fs';
import { logger } from './logger.js';

function log(msg) {
  logger.info(msg);
  console.log('\x1b[35m' + msg + '\x1b[0m');
}

function warn(msg) {
  logger.warn(msg);
  console.warn('\x1b[33m⚠ ' + msg + '\x1b[0m');
}

function fail(msg) {
  logger.error(msg);
  console.error('\x1b[31m✗ DIAG: ' + msg + '\x1b[0m');
}

function toStandardBase64(str) {
  return str.replace(/-/g, '+').replace(/_/g, '/');
}

export function runSessionDiagnostic() {
  console.log('\x1b[33m\n━━━━━━━━━━━━ SESSION DIAGNOSTIC ━━━━━━━━━━━━\x1b[0m');

  const raw = process.env.SESSION_ID;

  if (!raw) {
    fail('SESSION_ID is not set in environment');
    return { pass: false, reason: 'SESSION_ID missing' };
  }

  log(`✓ Raw SESSION_ID length: ${raw.length} chars`);
  log(`  First 10 chars: ${raw.substring(0, 10)}`);
  log(`  Last  10 chars: ${raw.substring(raw.length - 10)}`);

  const hasNewlines = /[\r\n]/.test(raw);
  const hasSpaces = / /.test(raw);
  log(`  Contains newlines: ${hasNewlines}`);
  log(`  Contains spaces  : ${hasSpaces}`);

  const cleaned = raw.replace(/[\r\n\s]/g, '');
  log(`✓ Cleaned length (whitespace removed): ${cleaned.length} chars`);

  const urlSafe = /[-_]/.test(cleaned) && !/[+/]/.test(cleaned);
  const mixed   = /[-_]/.test(cleaned) && /[+/]/.test(cleaned);
  log(`  URL-safe Base64 chars (-/_): ${urlSafe}`);
  log(`  Mixed Base64 chars         : ${mixed}`);

  const standard = toStandardBase64(cleaned);
  const padded   = standard + '='.repeat((4 - (standard.length % 4)) % 4);
  log(`  Padding added: ${padded.length - standard.length} '=' chars`);

  let rawBuf;
  try {
    rawBuf = Buffer.from(padded, 'base64');
  } catch (err) {
    fail(`Buffer.from() failed: ${err.message}`);
    return { pass: false, reason: 'Buffer.from failed', error: err.message };
  }

  log(`✓ Buffer decoded — byte length: ${rawBuf.length}`);

  const decoded = rawBuf.toString('utf-8');
  log(`✓ UTF-8 string length: ${decoded.length} chars`);
  log(`  Starts with '{' : ${decoded[0] === '{'}`);
  log(`  Ends   with '}' : ${decoded[decoded.length - 1] === '}'}`);
  log(`  First char code : ${decoded.charCodeAt(0)}`);
  log(`  Last  char code : ${decoded.charCodeAt(decoded.length - 1)}`);

  const openBraces  = (decoded.match(/\{/g) || []).length;
  const closeBraces = (decoded.match(/\}/g) || []).length;
  const quotes      = (decoded.match(/"/g) || []).length;
  log(`  Open  braces '{': ${openBraces}`);
  log(`  Close braces '}': ${closeBraces}`);
  log(`  Braces balanced : ${openBraces === closeBraces}`);
  log(`  Quote chars '"' : ${quotes}`);
  log(`  Quotes even     : ${quotes % 2 === 0}`);

  try {
    writeFileSync('/tmp/session_debug.txt', decoded, 'utf-8');
    log('✓ Raw decoded string saved to /tmp/session_debug.txt');
  } catch (e) {
    warn(`Could not write /tmp/session_debug.txt: ${e.message}`);
  }

  let parseResult = null;
  try {
    parseResult = JSON.parse(decoded);
    log('✓ JSON.parse() succeeded');
    const rootKeys = Object.keys(parseResult);
    log(`  Root keys: ${rootKeys.join(', ')}`);
  } catch (err) {
    fail(`JSON.parse() failed: ${err.message}`);
    const pos = parseInt((err.message.match(/position (\d+)/) || [])[1] || '-1', 10);
    if (pos >= 0) {
      const snippet = decoded.substring(Math.max(0, pos - 40), pos + 40);
      fail(`  Context around position ${pos}: ...${snippet}...`);
      fail(`  Char at position ${pos}: code=${decoded.charCodeAt(pos)} char='${decoded[pos]}'`);

      if (pos === decoded.length || pos === decoded.length - 1) {
        fail('  → JSON ends exactly at error position — string is TRUNCATED');
      } else {
        fail(`  → Corruption is mid-string — char at position is unexpected`);
      }
    }
    console.log('\x1b[33m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n');
    return {
      pass: false,
      reason: 'JSON.parse failed',
      error: err.message,
      position: pos,
      decodedLength: decoded.length,
      rawLength: raw.length,
      cleanedLength: cleaned.length,
      bufferBytes: rawBuf.length,
      balanced: openBraces === closeBraces,
      quotesEven: quotes % 2 === 0,
    };
  }

  console.log('\x1b[33m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n');
  return {
    pass: true,
    parsed: parseResult,
    rawLength: raw.length,
    cleanedLength: cleaned.length,
    bufferBytes: rawBuf.length,
    decodedLength: decoded.length,
  };
}
