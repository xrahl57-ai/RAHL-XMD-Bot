import { buildJid, getJidNumber, FOOTER } from '../../utils/helpers.js';

export default {
  name: 'demote',
  aliases: ['unadmin'],
  description: 'Demote an admin to member',
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  cooldown: 5,

  async execute({ sock, msg, jid, args, isBotAdmin }) {
    if (!isBotAdmin) {
      return sock.sendMessage(jid, { text: '❌ I need to be an admin to demote members.' }, { quoted: msg });
    }

    let target = msg.message?.extendedTextMessage?.contextInfo?.participant ||
      (args[0] ? buildJid(args[0].replace('@', '')) : null);

    if (!target) {
      return sock.sendMessage(jid, { text: `❌ Usage: .demote @user\n\n${FOOTER}` }, { quoted: msg });
    }

    await sock.groupParticipantsUpdate(jid, [target], 'demote');
    await sock.sendMessage(jid, {
      text: `⬇️ *Demoted to Member:* @${getJidNumber(target)}\n\n${FOOTER}`,
      mentions: [target],
    }, { quoted: msg });
  },
};
