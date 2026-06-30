import { formatUptime, formatBytes } from '../../utils/helpers.js';
import { getBotInfo } from '../../services/whatsapp.js';
import { getConnectionStatus } from '../../database/mongodb.js';
import { config } from '../../config/config.js';

export default {
  name: 'info',
  aliases: ['botinfo', 'about'],
  description: 'Display bot information',
  category: 'general',
  cooldown: 5,

  async execute({ sock, msg, jid }) {
    const botInfo  = getBotInfo();
    const uptime   = formatUptime(botInfo.startTime);
    const dbStatus = getConnectionStatus();
    const mem      = process.memoryUsage();

    const wa = botInfo.connected  ? '🟢 Connected' : '🔴 Disconnected';
    const db = dbStatus.connected ? '🟢 Connected' : '🔴 Disconnected';

    await sock.sendMessage(jid, {
      text:
        `╔══════════════════════╗\n` +
        `║  📊  *BOT INFORMATION*  ║\n` +
        `╚══════════════════════╝\n\n` +
        `🤖 *Name* ➜ ${config.botName}\n` +
        `👑 *Owner* ➜ ${config.ownerName}\n` +
        `📦 *Version* ➜ ${config.version}\n` +
        `🔑 *Prefix* ➜ \`${config.prefix}\`\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `⏱️ *Uptime* ➜ ${uptime}\n` +
        `💾 *Heap* ➜ ${formatBytes(mem.heapUsed)}\n` +
        `🧠 *RAM* ➜ ${formatBytes(mem.rss)}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📡 *WhatsApp* ➜ ${wa}\n` +
        `🗄️ *Database* ➜ ${db}\n` +
        `🖥️ *Platform* ➜ ${process.platform}\n` +
        `📦 *Node.js* ➜ ${process.version}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `⚡ _Powered by RAHL XMD_ 🦅`,
    }, { quoted: msg });
  },
};
