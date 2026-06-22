import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import NodeCache from 'node-cache';
import { logger } from '../utils/logger.js';
import { decodeSession } from '../utils/sessionLoader.js';
import { config } from '../config/config.js';
import { loadCommands } from '../handlers/commandHandler.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SESSION_DIR = join(__dirname, '../../.session');

let botSocket = null;
let startTime = Date.now();
let retryCount = 0;
let botInfo = { connected: false, number: '', name: '' };
let baileysAvailable = false;

const msgRetryCache = new NodeCache();

export function getBotSocket() {
  return botSocket;
}

export function getBotInfo() {
  return { ...botInfo, uptime: Date.now() - startTime, startTime };
}

export function isBaileysAvailable() {
  return baileysAvailable;
}

function restoreSessionFromBase64() {
  const sessionId = config.sessionId;
  if (!sessionId) return false;

  try {
    const sessionData = decodeSession(sessionId);
    if (!sessionData) return false;

    mkdirSync(SESSION_DIR, { recursive: true });

    const creds = sessionData.creds || sessionData;
    writeFileSync(
      join(SESSION_DIR, 'creds.json'),
      JSON.stringify(creds, null, 2),
    );

    if (sessionData.keys) {
      writeFileSync(
        join(SESSION_DIR, 'app-state-sync-key.json'),
        JSON.stringify(sessionData.keys, null, 2),
      );
    }

    logger.info('Session restored from BASE64 successfully.');
    return true;
  } catch (err) {
    logger.error('Failed to restore session:', err.message);
    return false;
  }
}

export async function startWhatsApp() {
  let baileys;
  try {
    baileys = await import('@whiskeysockets/baileys');
    baileysAvailable = true;
  } catch (err) {
    logger.warn('Baileys not available in this environment. WhatsApp connection disabled.');
    logger.warn('Deploy to Railway/Render/VPS to run the full bot with WhatsApp.');
    console.log(chalk.yellow('⚠ Baileys not available — Deploy to Railway/Render/VPS for WhatsApp.'));
    console.log(chalk.yellow('  Dashboard-only mode active on this platform.'));
    return null;
  }

  const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    isJidBroadcast,
  } = baileys;

  const { Boom } = await import('@hapi/boom');

  mkdirSync(SESSION_DIR, { recursive: true });

  const sessionExists = existsSync(join(SESSION_DIR, 'creds.json'));
  if (!sessionExists) {
    const restored = restoreSessionFromBase64();
    if (!restored) {
      logger.error('Could not restore session from SESSION_ID.');
      return null;
    }
  }

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  logger.info(`Using Baileys version: ${version.join('.')}`);

  const commands = await loadCommands();
  console.log(chalk.hex('#7B2FBE')(`✓ Commands Loaded (${commands.size} commands)`));

  const silentLogger = {
    fatal: () => {},
    warn: () => {},
    error: (msg) => logger.error(msg),
    info: () => {},
    debug: () => {},
    trace: () => {},
    child: () => silentLogger,
    level: 'silent',
  };

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, silentLogger),
    },
    printQRInTerminal: false,
    logger: silentLogger,
    msgRetryCounterCache: msgRetryCache,
    generateHighQualityLinkPreview: true,
    getMessage: async () => ({ conversation: '' }),
    shouldIgnoreJid: (jid) => isJidBroadcast(jid),
    syncFullHistory: false,
    markOnlineOnConnect: false,
    connectTimeoutMs: 60_000,
    keepAliveIntervalMs: 10_000,
    retryRequestDelayMs: 250,
  });

  botSocket = sock;

  const { handleMessage } = await import('../handlers/messageHandler.js');
  const { handleConnection } = await import('../events/connection.js');
  const { handleGroupUpdate } = await import('../events/groupUpdate.js');
  const { handleParticipantUpdate } = await import('../events/participantUpdate.js');
  const { handleCall } = await import('../events/callHandler.js');

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    await handleConnection(sock, update, async () => {
      if (retryCount < config.reconnect.maxRetries) {
        retryCount++;
        logger.warn(`Reconnecting... attempt ${retryCount}`);
        setTimeout(() => startWhatsApp(), config.reconnect.delayMs);
      } else {
        logger.error('Max reconnect attempts reached.');
      }
    });

    if (update.connection === 'open') {
      retryCount = 0;
      botInfo.connected = true;
      const number = sock.user?.id?.split(':')[0] || '';
      botInfo.number = number;
      botInfo.name = sock.user?.name || config.botName;
      console.log(chalk.hex('#7B2FBE')('✓ WhatsApp Connected'));
      logger.info(`Connected as ${number}`);
    } else if (update.connection === 'close') {
      botInfo.connected = false;
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (!msg.message) continue;
      await handleMessage(sock, msg, commands).catch((e) =>
        logger.error('Message handler error:', e.message),
      );
    }
  });

  sock.ev.on('groups.update', async (updates) => {
    for (const update of updates) {
      await handleGroupUpdate(sock, update).catch((e) =>
        logger.error('Group update error:', e.message),
      );
    }
  });

  sock.ev.on('group-participants.update', async (update) => {
    await handleParticipantUpdate(sock, update).catch((e) =>
      logger.error('Participant update error:', e.message),
    );
  });

  sock.ev.on('call', async (calls) => {
    for (const call of calls) {
      await handleCall(sock, call).catch((e) =>
        logger.error('Call handler error:', e.message),
      );
    }
  });

  return sock;
}
