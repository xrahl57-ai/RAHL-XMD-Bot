import PremiumUser from '../../database/models/PremiumUser.js';
import { buildJid, getJidNumber, FOOTER } from '../../utils/helpers.js';

export default {
  name: 'delprem',
  aliases: ['delpremium', 'removeprem'],
  description: 'Remove a premium user',
  category: 'owner',
  ownerOnly: true,
  cooldown: 5,

  async execute({ sock, msg, jid, args }) {
    let target = msg.message?.extendedTextMessage?.contextInfo?.participant || args[0];
    if (!target) {
      return sock.sendMessage(jid, { text: `❌ Usage: .delprem @user\n\n${FOOTER}` }, { quoted: msg });
    }
    const targetJid = target.includes('@') ? target : buildJid(target);
    await PremiumUser.findOneAndDelete({ jid: targetJid });
    await sock.sendMessage(jid, {
      text: `🗑️ *Premium Removed!*\n\n👤 User: +${getJidNumber(targetJid)}\n\n${FOOTER}`,
    }, { quoted: msg });
  },
};
