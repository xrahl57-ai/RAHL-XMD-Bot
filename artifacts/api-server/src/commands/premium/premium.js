import PremiumUser from '../../database/models/PremiumUser.js';
import { getJidNumber, formatDate, FOOTER } from '../../utils/helpers.js';
import moment from 'moment';

export default {
  name: 'premium',
  aliases: ['mypremium', 'checkprem'],
  description: 'Check your premium status',
  category: 'premium',
  cooldown: 5,

  async execute({ sock, msg, jid, sender }) {
    const premUser = await PremiumUser.findOne({ jid: sender }).lean();

    if (!premUser) {
      return sock.sendMessage(jid, {
        text: `💎 *Premium Status*\n\n❌ You are not a premium user.\n\nContact the owner to get premium:\nwa.me/${process.env.OWNER_NUMBER || '254112399557'}\n\n${FOOTER}`,
      }, { quoted: msg });
    }

    const expired = premUser.expiresAt && new Date() > premUser.expiresAt;
    const expiry = premUser.expiresAt
      ? `${formatDate(premUser.expiresAt)} (${moment(premUser.expiresAt).fromNow()})`
      : 'Lifetime';

    await sock.sendMessage(jid, {
      text: `💎 *Premium Status*\n\n👤 User: +${getJidNumber(sender)}\n✅ Status: ${expired ? '❌ Expired' : '✅ Active'}\n📅 Expires: ${expiry}\n\n${FOOTER}`,
    }, { quoted: msg });
  },
};
