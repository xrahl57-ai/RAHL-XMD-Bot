import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  isJidBroadcast,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import NodeCache from 'node-cache';
import { logger } from '../utils/logger.js';
import { decodeAndParseSession } from '../utils/sessionLoader.js';
import { config } from '../config/config.js';
import { loadCommands } from '../handlers/commandHandler.js';
import { handleMessage } from '../handlers/messageHandler.js';
import { handleConnection } from '../events/connection.js';
import { handleGroupUpdate } from '../events/groupUpdate.js';
import { handleParticipantUpdate } from '../events/participantUpdate.js';
import { handleCall } from '../events/callHandler.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SESSION_DIR = join(__dirname, '../../.session');

let botSocket = null;
const startTime = Date.now();
let retryCount = 0;
let botInfo = { connected: false, number: '', name: '' };

const msgRetryCache = new NodeCache();

const silentLogger = {
  fatal: (msg, ...args) => logger.error(`[Baileys FATAL] ${msg}`, ...args),
  error: (msg, ...args) => logger.error(`[Baileys ERROR] ${msg}`, ...args),
  warn: (msg, ...args) => logger.warn(`[Baileys WARN] ${msg}`, ...args),
  info: () => {},
  debug: () => {},
  trace: () => {},
  child: () => silentLogger,
  level: 'silent',
};

export function getBotSocket() {
  return botSocket;
}

export function getBotInfo() {
  return { ...botInfo, uptime: Date.now() - startTime, startTime };
}

function restoreSessionFromBase64() {
  const sessionId = config.sessionId;

  if (!sessionId) {
    logger.error('SESSION_ID is not set in environment variables.');
    console.error(chalk.red('✗ SESSION_ID missing — set it in your environment.'));
    return false;
  }

  console.log(chalk.hex('#7B2FBE')('✓ SESSION_ID found — beginning decode...'));

  const result = decodeAndParseSession(sessionId);

  if (!result) {
    logger.error('Session decode/parse failed — see diagnostic output above for exact reason.');
    console.error(chalk.red('✗ SESSION_ID failed to decode/parse — bot cannot start without a valid session.'));
    return false;
  }

  try {
    mkdirSync(SESSION_DIR, { recursive: true });

    writeFileSync(join(SESSION_DIR, 'creds.json'), JSON.stringify(result.creds, null, 2));
    logger.info(`creds.json written to .session/ (layout: ${result.layout}, source: ${result.source})`);
    console.log(chalk.hex('#7B2FBE')(`✓ creds.json written (layout: ${result.layout})`));

    if (result.keys && typeof result.keys === 'object' && Object.keys(result.keys).length > 0) {
      writeFileSync(
        join(SESSION_DIR, 'app-state-sync-key.json'),
        JSON.stringify(result.keys, null, 2),
      );
      logger.info('app-state-sync-key.json written to .session/');
      console.log(chalk.hex('#7B2FBE')('✓ keys written to .session/'));
    } else {
      logger.info('No keys in session data — skipping app-state-sync-key.json');
    }

    console.log(chalk.hex('#7B2FBE')('✓ Initializing Baileys with restored session...'));
    logger.info('Session fully restored — Baileys can now initialize.');
    return true;
  } catch (err) {
    logger.error('Failed to write session files to .session/:', err.message);
    console.error(chalk.red('✗ Session file write error:'), err.message);
    return false;
  }
}

export async function startWhatsApp() {
  mkdirSync(SESSION_DIR, { recursive: true });

  const sessionExists = existsSync(join(SESSION_DIR, 'creds.json'));
  if (!sessionExists) {
    const restored = restoreSessionFromBase64();
    if (!restored) {
      const err = new Error('Could not restore session from SESSION_ID — creds.json missing after decode attempt.');
      logger.error(err.message);
      console.error(chalk.red('✗ Session restore failed:'), err.message);
      throw err;
    }
  }

  console.log(chalk.hex('#7B2FBE')('✓ Baileys Loaded'));
  logger.info('Baileys loaded successfully.');

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  logger.info(`Baileys version: ${version.join('.')}`);

  const commands = await loadCommands();
  console.log(chalk.hex('#7B2FBE')(`✓ Commands Loaded (${commands.size} commands)`));
  logger.info(`Commands loaded: ${commands.size}`);

  console.log(chalk.hex('#7B2FBE')('✓ Connecting To WhatsApp...'));
  logger.info('Attempting WhatsApp connection...');

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

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    await handleConnection(sock, update, async () => {
      if (retryCount < config.reconnect.maxRetries) {
        retryCount++;
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
        logger.warn(`Connection closed (reason: ${reason}). Reconnecting... attempt ${retryCount}`);
        console.log(chalk.yellow(`⚠ Reconnecting (attempt ${retryCount}/${config.reconnect.maxRetries})...`));
        setTimeout(() => startWhatsApp(), config.reconnect.delayMs);
      } else {
        logger.error('Max reconnect attempts reached. Bot stopped reconnecting.');
        console.error(chalk.red('✗ Max reconnect attempts reached.'));
      }
    });

    if (connection === 'open') {
      retryCount = 0;
      botInfo.connected = true;
      const number = sock.user?.id?.split(':')[0] || '';
      botInfo.number = number;
      botInfo.name = sock.user?.name || config.botName;
      console.log(chalk.hex('#7B2FBE')('✓ WhatsApp Connected'));
      logger.info(`WhatsApp connected as +${number}`);
    } else if (connection === 'close') {
      botInfo.connected = false;
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      logger.warn(`WhatsApp disconnected. Status code: ${statusCode}`);
      console.log(chalk.yellow(`⚠ WhatsApp disconnected (status: ${statusCode})`));
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (!msg.message) continue;
      await handleMessage(sock, msg, commands).catch((e) => {
        logger.error('Message handler error:', e);
        console.error(chalk.red('[MessageHandler Error]'), e);
      });
    }
  });

  sock.ev.on('groups.update', async (updates) => {
    for (const update of updates) {
      await handleGroupUpdate(sock, update).catch((e) => {
        logger.error('Group update error:', e);
      });
    }
  });

  sock.ev.on('group-participants.update', async (update) => {
    await handleParticipantUpdate(sock, update).catch((e) => {
      logger.error('Participant update error:', e);
    });
  });

  sock.ev.on('call', async (calls) => {
    for (const call of calls) {
      await handleCall(sock, call).catch((e) => {
        logger.error('Call handler error:', e);
      });
    }
  });

  return sock;
}
