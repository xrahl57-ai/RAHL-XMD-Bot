import Warning from '../../database/models/Warning.js';
import { buildJid, getJidNumber, FOOTER } from '../../utils/helpers.js';

export default {
  name: 'resetwarn',
  aliases: ['clearwarn', 'unwarn'],
  description: 'Reset warnings for a member',
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  cooldown: 5,

  async execute({ sock, msg, jid, args }) {
    let target = msg.message?.extendedTextMessage?.contextInfo?.participant ||
      (args[0] ? buildJid(args[0].replace('@', '')) : null);

    if (!target) {
      return sock.sendMessage(jid, { text: `❌ Usage: .resetwarn @user\n\n${FOOTER}` }, { quoted: msg });
    }

    await Warning.findOneAndDelete({ jid: target, groupJid: jid });
    await sock.sendMessage(jid, {
      text: `✅ Warnings cleared for @${getJidNumber(target)}\n\n${FOOTER}`,
      mentions: [target],
    }, { quoted: msg });
  },
};
