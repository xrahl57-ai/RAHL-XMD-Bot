import PremiumUser from '../../database/models/PremiumUser.js';
import { buildJid, getJidNumber, FOOTER } from '../../utils/helpers.js';
import moment from 'moment';

export default {
  name: 'addprem',
  aliases: ['addpremium'],
  description: 'Add a premium user',
  category: 'owner',
  ownerOnly: true,
  cooldown: 5,

  async execute({ sock, msg, jid, args, sender }) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.participant;
    let target = mentioned || args[0];
    const days = parseInt(mentioned ? args[0] : args[1]) || 30;

    if (!target) {
      return sock.sendMessage(jid, {
        text: `❌ Usage: .addprem @user [days]\nExample: .addprem @user 30\n\n${FOOTER}`,
      }, { quoted: msg });
    }

    // Build a proper JID: if already a full JID (has @s.whatsapp.net) keep it,
    // otherwise strip any leading @ and build from the number
    const targetJid = target.includes('@s.whatsapp.net')
      ? target
      : buildJid(target.replace('@', ''));

    if (!getJidNumber(targetJid)) {
      return sock.sendMessage(jid, {
        text: `❌ Usage: .addprem @user [days]\nExample: .addprem @user 30\n\n${FOOTER}`,
      }, { quoted: msg });
    }

    const expiresAt = moment().add(days, 'days').toDate();

    await PremiumUser.findOneAndUpdate(
      { jid: targetJid },
      {
        name: getJidNumber(targetJid),
        addedBy: sender,
        addedAt: new Date(),
        expiresAt,
        active: true,
      },
      { upsert: true },
    );

    await sock.sendMessage(jid, {
      text: `💎 *Premium Added!*\n\n👤 User: +${getJidNumber(targetJid)}\n📅 Expires: ${moment(expiresAt).format('DD/MM/YYYY')}\n⏳ Duration: ${days} days\n\n${FOOTER}`,
    }, { quoted: msg });
  },
};
