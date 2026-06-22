import { formatUptime, FOOTER } from '../../utils/helpers.js';
import { getBotInfo } from '../../services/whatsapp.js';

export default {
  name: 'runtime',
  aliases: ['uptime', 'up'],
  description: 'Show bot uptime',
  category: 'general',
  cooldown: 5,

  async execute({ sock, msg, jid }) {
    const botInfo = getBotInfo();
    const uptime = formatUptime(botInfo.startTime);

    await sock.sendMessage(jid, {
      text: `⚡ *Bot Runtime*\n\n🕐 Uptime: *${uptime}*\n\n${FOOTER}`,
    }, { quoted: msg });
  },
};
