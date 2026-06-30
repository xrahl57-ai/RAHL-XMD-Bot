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
import {
  saveSessionToMongo,
  loadSessionFromMongo,
  hasSessionInMongo,
} from '../database/sessionStore.js';
import { cacheIncoming, handleDeletedMessages } from '../events/antiDelete.js';
import { handleViewOnce } from '../events/viewOnce.js';

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
  warn:  (msg, ...args) => logger.warn(`[Baileys WARN] ${msg}`, ...args),
  info:  () => {},
  debug: () => {},
  trace: () => {},
  child: () => silentLogger,
  level: 'silent',
};

export function getBotSocket() { return botSocket; }
export function getBotInfo() {
  return { ...botInfo, uptime: Date.now() - startTime, startTime };
}

async function resolveSession() {
  mkdirSync(SESSION_DIR, { recursive: true });

  const credsExist = existsSync(join(SESSION_DIR, 'creds.json'));

  if (credsExist) {
    console.log(chalk.hex('#7B2FBE')('✓ Session found in .session/ (container cache)'));
    logger.info('Session found in .session/ — using existing files.');
    return 'file';
  }

  const mongoAvailable = await hasSessionInMongo('rahl-xmd').catch(() => false);
  if (mongoAvailable) {
    console.log(chalk.hex('#7B2FBE')('✓ Session found in MongoDB — restoring...'));
    const restored = await loadSessionFromMongo(SESSION_DIR, 'rahl-xmd');
    if (restored) return 'mongo';
    logger.warn('MongoDB session found but restore failed — trying SESSION_ID.');
  }

  const sessionId = config.sessionId;
  if (sessionId) {
    console.log(chalk.hex('#7B2FBE')('✓ Trying SESSION_ID env var...'));
    const result = decodeAndParseSession(sessionId);
    if (result) {
      writeFileSync(join(SESSION_DIR, 'creds.json'), JSON.stringify(result.creds, null, 2));
      logger.info(`Session restored from SESSION_ID (layout: ${result.layout}, source: ${result.source})`);
      console.log(chalk.hex('#7B2FBE')(`✓ Session decoded from SESSION_ID (layout: ${result.layout})`));

      if (result.keys && typeof result.keys === 'object' && Object.keys(result.keys).length > 0) {
        writeFileSync(
          join(SESSION_DIR, 'app-state-sync-key.json'),
          JSON.stringify(result.keys, null, 2),
        );
      }
      return 'env';
    }
    logger.warn('SESSION_ID decode failed — falling through to pairing code mode.');
    console.log(chalk.yellow('⚠ SESSION_ID is corrupt or incomplete — will use pairing code.'));
  }

  return 'pairing';
}

export async function startWhatsApp() {
  const sessionSource = await resolveSession();

  console.log(chalk.hex('#7B2FBE')('✓ Baileys Loaded'));
  logger.info('Baileys loaded successfully.');

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();
  logger.info(`Baileys version: ${version.join('.')}`);

  const commands = await loadCommands();
  console.log(chalk.hex('#7B2FBE')(`✓ Commands Loaded (${commands.size} commands)`));
  logger.info(`Commands loaded: ${commands.size}`);

  console.log(chalk.hex('#7B2FBE')('✓ Connecting To WhatsApp...'));
  logger.info(`Attempting WhatsApp connection (session source: ${sessionSource})...`);

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

  if (sessionSource === 'pairing') {
    const ownerNumber = config.ownerNumber.replace(/\D/g, '');
    try {
      await new Promise((r) => setTimeout(r, 3000));
      const code = await sock.requestPairingCode(ownerNumber);
      const formatted = code.match(/.{1,4}/g)?.join('-') || code;
      console.log(chalk.hex('#FFD700')('\n👑━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━👑'));
      console.log(chalk.hex('#FFD700').bold(`  PAIRING CODE : ${formatted}`));
      console.log(chalk.white('  1. Open WhatsApp → Linked Devices → Link a Device'));
      console.log(chalk.white('  2. Tap "Link with Phone Number Instead"'));
      console.log(chalk.white(`  3. Enter: ${formatted}`));
      console.log(chalk.hex('#FFD700')('👑━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━👑\n'));
      logger.info(`Pairing code issued: ${formatted}`);
    } catch (err) {
      logger.error('Failed to request pairing code:', err.message);
      console.error(chalk.red('✗ Could not generate pairing code:'), err.message);
    }
  }

  sock.ev.on('creds.update', async () => {
    await saveCreds();
    saveSessionToMongo(SESSION_DIR, 'rahl-xmd').catch(() => {});
  });

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

      await saveSessionToMongo(SESSION_DIR, 'rahl-xmd').catch(() => {});
      console.log(chalk.hex('#7B2FBE')('✓ Session saved to MongoDB'));
      logger.info('Full session saved to MongoDB after successful connection.');

      // Send banner to owner DM on successful connection
      try {
        const { readFileSync } = await import('fs');
        const { dirname, join } = await import('path');
        const { fileURLToPath } = await import('url');
        const __dir = dirname(fileURLToPath(import.meta.url));
        const bannerPath = join(__dir, '../assets/banner.jpg');
        const banner = readFileSync(bannerPath);
        await sock.sendMessage(config.ownerJid, {
          image: banner,
          caption: `╔══════════════════════╗\n║    👑 *RAHL XMD* 👑    ║\n╚══════════════════════╝\n\n✅ *Bot is Online!*\n📱 *Number:* +${number}\n🛡️ *Status:* Connected\n\n⚡ _RAHL XMD ready to serve, LORD RAHL!_`,
        });
      } catch (e) {
        logger.warn('[startup] Could not send banner to owner:', e.message);
      }
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
      cacheIncoming(sock, msg).catch(() => {});
      handleViewOnce(sock, msg).catch(() => {});
      await handleMessage(sock, msg, commands).catch((e) => {
        logger.error('Message handler error:', e);
        console.error(chalk.red('[MessageHandler Error]'), e);
      });
    }
  });

  sock.ev.on('messages.delete', async (item) => {
    handleDeletedMessages(sock, item).catch((e) => {
      logger.error('Anti-delete handler error:', e.message);
    });
  });

  // Baileys fires deletions as messages.update with protocolMessage type REVOKE (0).
  // IMPORTANT: u.key is the key of the revoke notification itself — NOT the deleted message.
  // The actual deleted message key lives inside protocolMessage.key.
  sock.ev.on('messages.update', async (updates) => {
    const deletedKeys = [];
    for (const u of updates) {
      const proto = u.update?.message?.protocolMessage;
      if (proto?.type === 0 && proto?.key) {
        // proto.key = key of the message that was deleted
        deletedKeys.push(proto.key);
      }
    }
    if (deletedKeys.length > 0) {
      handleDeletedMessages(sock, { keys: deletedKeys }).catch((e) => {
        logger.error('Anti-delete (update) error:', e.message);
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
