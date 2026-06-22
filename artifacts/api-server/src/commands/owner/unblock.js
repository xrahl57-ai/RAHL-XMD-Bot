import { buildJid, getJidNumber, FOOTER } from '../../utils/helpers.js';

export default {
  name: 'unblock',
  aliases: [],
  description: 'Unblock a user',
  category: 'owner',
  ownerOnly: true,
  cooldown: 5,

  async execute({ sock, msg, jid, args }) {
    let target = msg.message?.extendedTextMessage?.contextInfo?.participant || args[0];
    if (!target) {
      return sock.sendMessage(jid, { text: `❌ Usage: .unblock @user or reply to a message\n\n${FOOTER}` }, { quoted: msg });
    }
    const targetJid = target.includes('@') ? target : buildJid(target);
    await sock.updateBlockStatus(targetJid, 'unblock');
    await sock.sendMessage(jid, { text: `✅ *Unblocked:* +${getJidNumber(targetJid)}\n\n${FOOTER}` }, { quoted: msg });
  },
};
