import { formatUptime } from '../../utils/helpers.js';
import { getBotInfo } from '../../services/whatsapp.js';

export default {
  name: 'runtime',
  aliases: ['uptime', 'up'],
  description: 'Show bot uptime',
  category: 'general',
  cooldown: 5,

  async execute({ sock, msg, jid }) {
    const uptime = formatUptime(getBotInfo().startTime);

    await sock.sendMessage(jid, {
      text:
        `👑══════════════════════👑\n` +
        `   ⏱️  *BOT RUNTIME*  ⏱️\n` +
        `👑══════════════════════👑\n\n` +
        `🕐 *Running for* ➜ *${uptime}*\n\n` +
        `_RAHL XMD has been serving non-stop!_ 💪\n\n` +
        `✦══════════════════════✦\n` +
        `⚡ _Powered by RAHL XMD_ 🦅`,
    }, { quoted: msg });
  },
};
