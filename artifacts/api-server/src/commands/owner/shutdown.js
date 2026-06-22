import { FOOTER } from '../../utils/helpers.js';

export default {
  name: 'shutdown',
  aliases: ['stop', 'poweroff'],
  description: 'Shutdown the bot',
  category: 'owner',
  ownerOnly: true,
  cooldown: 60,

  async execute({ sock, msg, jid }) {
    await sock.sendMessage(jid, { text: `🔴 *Shutting down RAHL XMD...*\n\nGoodbye!\n\n${FOOTER}` }, { quoted: msg });
    setTimeout(() => process.exit(1), 2000);
  },
};
