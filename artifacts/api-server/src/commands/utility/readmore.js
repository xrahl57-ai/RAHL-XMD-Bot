import { FOOTER } from '../../utils/helpers.js';

const READMORE = String.fromCharCode(8206).repeat(4001);

export default {
  name: 'readmore',
  aliases: ['rm', 'seemore'],
  description: 'Add a read more button to text',
  category: 'utility',
  cooldown: 5,

  async execute({ sock, msg, jid, args }) {
    const parts = args.join(' ').split('|');
    if (parts.length < 2) {
      return sock.sendMessage(jid, {
        text: `❌ Usage: .readmore <visible text>|<hidden text>\nExample: .readmore Hello!|This is the hidden part\n\n${FOOTER}`,
      }, { quoted: msg });
    }

    const visible = parts[0].trim();
    const hidden = parts.slice(1).join('|').trim();

    await sock.sendMessage(jid, {
      text: `${visible}${READMORE}${hidden}`,
    }, { quoted: msg });
  },
};
