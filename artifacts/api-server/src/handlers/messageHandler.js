import { config } from '../config/config.js';
import { getCommand } from './commandHandler.js';
import { logger, logCommand, logError } from '../utils/logger.js';
import {
  isBlacklisted,
  isOnCooldown,
  setCooldown,
  checkRateLimit,
  checkFlood,
  getCooldownRemaining,
} from '../utils/antiSpam.js';
import { isGroup, getJidNumber } from '../utils/helpers.js';
import User from '../database/models/User.js';
import Group from '../database/models/Group.js';
import Statistics from '../database/models/Statistics.js';
import { getGroupAntiSettings, checkAntiLink } from '../events/message.js';

function extractBody(msg) {
  const m = msg.message;
  if (!m) return '';
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    m.buttonsResponseMessage?.selectedButtonId ||
    m.listResponseMessage?.singleSelectReply?.selectedRowId ||
    ''
  );
}

async function upsertUser(jid, name) {
  try {
    await User.findOneAndUpdate(
      { jid },
      { name, lastSeen: new Date(), $inc: { commandCount: 1 } },
      { upsert: true, new: true },
    );
  } catch (_) {}
}

async function incrementStats(field) {
  try {
    const today = new Date().toISOString().split('T')[0];
    await Statistics.findOneAndUpdate(
      { date: today },
      { $inc: { [field]: 1 } },
      { upsert: true },
    );
  } catch (_) {}
}

// ── Replay / duplicate protection ────────────────────────────────────────────
// Baileys re-fires old messages from session history on every reconnect.
// This Set tracks message IDs we have already processed in this session.
// TTL cleanup (5 min) prevents unbounded memory growth.
const _seenIds = new Set();

function markSeen(id) {
  _seenIds.add(id);
  setTimeout(() => _seenIds.delete(id), 5 * 60 * 1000);
}

// Max age for a message to be considered "live" and worth processing.
// Anything older than this is a replay from history — ignore it.
const MAX_MSG_AGE_MS = 30_000; // 30 seconds

export async function handleMessage(sock, msg, commands) {
  try {
    const jid = msg.key.remoteJid;
    if (!jid) return;

    // ── Duplicate guard ───────────────────────────────────────────────────────
    const msgId = msg.key?.id;
    if (msgId) {
      if (_seenIds.has(msgId)) return; // already processed in this session
      markSeen(msgId);
    }

    // ── Age gate — drop replayed / historical messages ────────────────────────
    const ts = msg.messageTimestamp;
    if (ts) {
      const ageMs = Date.now() - Number(ts) * 1000;
      if (ageMs > MAX_MSG_AGE_MS) return; // stale replay — skip silently
    }

    const isGroupChat = isGroup(jid);
    const sender = isGroupChat
      ? msg.key.participant || msg.key.remoteJid
      : msg.key.remoteJid;

    if (isBlacklisted(sender)) return;

    const body = extractBody(msg);
    const prefix = config.prefix;

    // Fire-and-forget — don't block message flow for stats tracking
    incrementStats('messagesReceived').catch(() => {});

    if (isGroupChat) {
      const antiSettings = await getGroupAntiSettings(jid);
      if (antiSettings?.antilink) {
        const blocked = await checkAntiLink(sock, msg, jid, sender);
        if (blocked) return;
      }
    }

    if (!body.startsWith(prefix)) return;

    const parts = body.slice(prefix.length).trim().split(/\s+/);
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);
    const fullArgs = args.join(' ');

    const command = getCommand(commandName);
    if (!command) return;

    if (checkFlood(sender)) {
      return sock.sendMessage(jid, { text: '⚠️ Slow down! Too many messages.' }, { quoted: msg });
    }

    if (checkRateLimit(sender)) {
      return sock.sendMessage(jid, { text: '⚠️ Rate limit exceeded. Please wait a minute.' }, { quoted: msg });
    }

    if (isOnCooldown(sender, commandName)) {
      const remaining = getCooldownRemaining(sender, commandName);
      return sock.sendMessage(
        jid,
        { text: `⏳ Please wait ${remaining}s before using .${commandName} again.` },
        { quoted: msg },
      );
    }

    const isOwner = getJidNumber(sender) === config.ownerNumber;

    if (command.ownerOnly && !isOwner) {
      return sock.sendMessage(jid, { text: '🚫 This command is for the *Owner* only.' }, { quoted: msg });
    }

    let isAdmin = false;
    let isBotAdmin = false;

    if (isGroupChat && (command.adminOnly || command.groupOnly)) {
      try {
        const metadata = await sock.groupMetadata(jid);
        const participants = metadata.participants || [];
        const senderNum = getJidNumber(sender);
        const botNum = getJidNumber(sock.user.id);

        isAdmin = participants.some(
          (p) => getJidNumber(p.id) === senderNum && (p.admin === 'admin' || p.admin === 'superadmin'),
        );
        isBotAdmin = participants.some(
          (p) => getJidNumber(p.id) === botNum && (p.admin === 'admin' || p.admin === 'superadmin'),
        );

        if (command.adminOnly && !isAdmin && !isOwner) {
          return sock.sendMessage(jid, { text: '🚫 This command is for *Admins* only.' }, { quoted: msg });
        }
      } catch (_) {}
    }

    if (command.groupOnly && !isGroupChat) {
      return sock.sendMessage(jid, { text: '🚫 This command can only be used in *Groups*.' }, { quoted: msg });
    }

    if (command.privateOnly && isGroupChat) {
      return sock.sendMessage(jid, { text: '🚫 This command can only be used in *Private* chat.' }, { quoted: msg });
    }

    const pushName = msg.pushName || 'User';
    // Fire-and-forget — DB writes happen in background, command runs immediately
    upsertUser(sender, pushName).catch(() => {});
    incrementStats('commandsRun').catch(() => {});

    logCommand(getJidNumber(sender), `${prefix}${commandName}`, isGroupChat ? jid : null);

    const cooldownTime = command.cooldown || config.antiSpam.cooldownSeconds;
    setCooldown(sender, commandName, cooldownTime);

    const context = {
      sock,
      msg,
      jid,
      sender,
      args,
      fullArgs,
      body,
      command: commandName,
      prefix,
      isGroup: isGroupChat,
      isOwner,
      isAdmin,
      isBotAdmin,
      pushName,
      config,
    };

    await command.execute(context);
  } catch (err) {
    logError('MessageHandler', err);
  }
}
