import { buildJid, getJidNumber, FOOTER } from '../../utils/helpers.js';

export default {
  name: 'promote',
  aliases: ['admin'],
  description: 'Promote a member to admin',
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  cooldown: 5,

  async execute({ sock, msg, jid, args, isBotAdmin }) {
    if (!isBotAdmin) {
      return sock.sendMessage(jid, { text: '❌ I need to be an admin to promote members.' }, { quoted: msg });
    }

    let target = msg.message?.extendedTextMessage?.contextInfo?.participant ||
      (args[0] ? buildJid(args[0].replace('@', '')) : null);

    if (!target) {
      return sock.sendMessage(jid, { text: `❌ Usage: .promote @user\n\n${FOOTER}` }, { quoted: msg });
    }

    await sock.groupParticipantsUpdate(jid, [target], 'promote');
    await sock.sendMessage(jid, {
      text: `⬆️ *Promoted to Admin:* @${getJidNumber(target)}\n\n${FOOTER}`,
      mentions: [target],
    }, { quoted: msg });
  },
};
