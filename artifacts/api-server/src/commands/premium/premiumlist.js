import PremiumUser from '../../database/models/PremiumUser.js';
import { getJidNumber, formatDate, FOOTER } from '../../utils/helpers.js';

export default {
  name: 'premiumlist',
  aliases: ['listprem', 'prems'],
  description: 'List all premium users',
  category: 'premium',
  ownerOnly: true,
  cooldown: 10,

  async execute({ sock, msg, jid }) {
    const premUsers = await PremiumUser.find({}).lean();

    if (!premUsers.length) {
      return sock.sendMessage(jid, {
        text: `💎 *Premium Users*\n\n❌ No premium users found.\n\n${FOOTER}`,
      }, { quoted: msg });
    }

    const list = premUsers.map((u, i) => {
      const expired = u.expiresAt && new Date() > u.expiresAt;
      const expiry = u.expiresAt ? formatDate(u.expiresAt) : 'Lifetime';
      return `${i + 1}. +${getJidNumber(u.jid)}\n   Status: ${expired ? '❌ Expired' : '✅ Active'}\n   Expires: ${expiry}`;
    }).join('\n\n');

    await sock.sendMessage(jid, {
      text: `💎 *Premium Users (${premUsers.length})*\n\n${list}\n\n${FOOTER}`,
    }, { quoted: msg });
  },
};
