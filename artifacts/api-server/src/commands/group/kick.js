import { buildJid, getJidNumber, FOOTER } from '../../utils/helpers.js';

export default {
  name: 'kick',
  aliases: ['remove', 'ban'],
  description: 'Kick a member from the group',
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  cooldown: 5,

  async execute({ sock, msg, jid, args, isBotAdmin }) {
    if (!isBotAdmin) {
      return sock.sendMessage(jid, { text: '❌ I need to be an admin to kick members.' }, { quoted: msg });
    }

    let target = msg.message?.extendedTextMessage?.contextInfo?.participant ||
      (args[0] ? buildJid(args[0].replace('@', '')) : null);

    if (!target) {
      return sock.sendMessage(jid, { text: `❌ Usage: .kick @user\n\n${FOOTER}` }, { quoted: msg });
    }

    await sock.groupParticipantsUpdate(jid, [target], 'remove');
    await sock.sendMessage(jid, {
      text: `👢 *Kicked:* @${getJidNumber(target)}\n\n${FOOTER}`,
      mentions: [target],
    }, { quoted: msg });
  },
};
