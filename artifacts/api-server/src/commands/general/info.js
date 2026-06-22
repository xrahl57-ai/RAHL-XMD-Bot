import { formatUptime, formatBytes, FOOTER } from '../../utils/helpers.js';
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
    const botInfo = getBotInfo();
    const uptime = formatUptime(botInfo.startTime);
    const dbStatus = getConnectionStatus();
    const mem = process.memoryUsage();

    const text = `╔══════════════════════╗
║  📊 *Bot Information* ║
╚══════════════════════╝

🤖 *Name:* ${config.botName}
👑 *Owner:* ${config.ownerName}
📦 *Version:* ${config.version}
🔑 *Prefix:* ${config.prefix}

⚡ *Uptime:* ${uptime}
💾 *Heap Used:* ${formatBytes(mem.heapUsed)}
🧠 *RSS Memory:* ${formatBytes(mem.rss)}

🟢 *WhatsApp:* ${botInfo.connected ? 'Connected' : 'Disconnected'}
💾 *Database:* ${dbStatus.connected ? 'Connected' : 'Disconnected'}
🖥️ *Platform:* ${process.platform}
📦 *Node.js:* ${process.version}

${FOOTER}`;

    await sock.sendMessage(jid, { text }, { quoted: msg });
  },
};
