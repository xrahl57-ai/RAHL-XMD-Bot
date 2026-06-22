import { formatUptime, BOT_NAME, OWNER_NAME, FOOTER } from '../../utils/helpers.js';
import { getBotInfo } from '../../services/whatsapp.js';
import { getConnectionStatus } from '../../database/mongodb.js';

export default {
  name: 'alive',
  aliases: ['online', 'active'],
  description: 'Check if the bot is alive',
  category: 'general',
  cooldown: 5,

  async execute({ sock, msg, jid }) {
    const botInfo = getBotInfo();
    const uptime = formatUptime(botInfo.startTime);
    const dbStatus = getConnectionStatus();

    const mem = process.memoryUsage();
    const memMB = (mem.rss / 1024 / 1024).toFixed(1);

    const text = `╔══════════════════════╗
║    👑 *RAHL XMD* 👑    ║
╚══════════════════════╝

✅ *Status:* Online & Active
🤖 *Bot:* ${BOT_NAME}
👑 *Owner:* ${OWNER_NAME}
⚡ *Uptime:* ${uptime}
🟢 *WhatsApp:* Connected
💾 *Database:* ${dbStatus.connected ? 'Connected' : 'Disconnected'}
🧠 *RAM Usage:* ${memMB} MB
📦 *Version:* 1.0.0

${FOOTER}`;

    await sock.sendMessage(jid, { text }, { quoted: msg });
  },
};
