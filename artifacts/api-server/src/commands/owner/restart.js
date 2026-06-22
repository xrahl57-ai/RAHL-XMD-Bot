import { FOOTER } from '../../utils/helpers.js';

export default {
  name: 'restart',
  aliases: ['reboot'],
  description: 'Restart the bot',
  category: 'owner',
  ownerOnly: true,
  cooldown: 30,

  async execute({ sock, msg, jid }) {
    await sock.sendMessage(jid, { text: `🔄 *Restarting RAHL XMD...*\n\nPlease wait a moment.\n\n${FOOTER}` }, { quoted: msg });
    setTimeout(() => process.exit(0), 2000);
  },
};
