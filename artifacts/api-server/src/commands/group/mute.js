import Group from '../../database/models/Group.js';
import { FOOTER } from '../../utils/helpers.js';

export default {
  name: 'mute',
  aliases: ['lock'],
  description: 'Mute the group (admins only can send)',
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  cooldown: 5,

  async execute({ sock, msg, jid, isBotAdmin }) {
    if (!isBotAdmin) {
      return sock.sendMessage(jid, { text: '❌ I need to be an admin to mute the group.' }, { quoted: msg });
    }

    await sock.groupSettingUpdate(jid, 'announcement');
    await Group.findOneAndUpdate({ jid }, { muted: true }, { upsert: true });
    await sock.sendMessage(jid, { text: `🔇 *Group Muted!*\nOnly admins can send messages.\n\n${FOOTER}` }, { quoted: msg });
  },
};
