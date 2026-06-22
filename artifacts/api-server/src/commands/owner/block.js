import { buildJid, getJidNumber, FOOTER } from '../../utils/helpers.js';

export default {
  name: 'block',
  aliases: [],
  description: 'Block a user',
  category: 'owner',
  ownerOnly: true,
  cooldown: 5,

  async execute({ sock, msg, jid, args, sender }) {
    let target = msg.message?.extendedTextMessage?.contextInfo?.participant || args[0];
    if (!target) {
      return sock.sendMessage(jid, { text: `❌ Usage: .block @user or reply to a message\n\n${FOOTER}` }, { quoted: msg });
    }
    const targetJid = target.includes('@') ? target : buildJid(target);
    await sock.updateBlockStatus(targetJid, 'block');
    await sock.sendMessage(jid, { text: `🚫 *Blocked:* +${getJidNumber(targetJid)}\n\n${FOOTER}` }, { quoted: msg });
  },
};
