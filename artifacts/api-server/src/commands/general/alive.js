import { formatUptime, BOT_NAME, OWNER_NAME } from '../../utils/helpers.js';
import { getBotInfo } from '../../services/whatsapp.js';
import { getConnectionStatus } from '../../database/mongodb.js';

export default {
  name: 'alive',
  aliases: ['online', 'active'],
  description: 'Check if the bot is alive',
  category: 'general',
  cooldown: 5,

  async execute({ sock, msg, jid }) {
    const botInfo  = getBotInfo();
    const uptime   = formatUptime(botInfo.startTime);
    const dbStatus = getConnectionStatus();
    const memMB    = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);

    const wa = botInfo.connected  ? '🟢 Connected' : '🔴 Disconnected';
    const db = dbStatus.connected ? '🟢 Connected' : '🔴 Disconnected';

    await sock.sendMessage(jid, {
      text:
        `👑══════════════════════👑\n` +
        `    🦅  *RAHL XMD*  🦅\n` +
        `👑══════════════════════👑\n\n` +
        `✅ *Bot is Online & Active!*\n\n` +
        `🤖 *Bot* ➜ ${BOT_NAME}\n` +
        `👑 *Owner* ➜ ${OWNER_NAME}\n` +
        `⏱️ *Uptime* ➜ ${uptime}\n` +
        `📡 *WhatsApp* ➜ ${wa}\n` +
        `🗄️ *Database* ➜ ${db}\n` +
        `🧠 *RAM* ➜ ${memMB} MB\n\n` +
        `✦══════════════════════✦\n` +
        `⚡ _Powered by RAHL XMD_ 🦅`,
    }, { quoted: msg });
  },
};
