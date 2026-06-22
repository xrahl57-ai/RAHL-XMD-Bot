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
    let target = msg.message?.extendedTextMessage?.contextInfo?.participant || args[0];
    const days = parseInt(args[1] || args[0]) || 30;

    if (!target || isNaN(getJidNumber(target))) {
      return sock.sendMessage(jid, {
        text: `❌ Usage: .addprem @user [days]\nExample: .addprem @user 30\n\n${FOOTER}`,
      }, { quoted: msg });
    }

    const targetJid = target.includes('@') ? target : buildJid(target);
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
