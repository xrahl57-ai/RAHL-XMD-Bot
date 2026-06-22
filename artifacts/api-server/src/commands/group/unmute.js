import Group from '../../database/models/Group.js';
import { FOOTER } from '../../utils/helpers.js';

export default {
  name: 'unmute',
  aliases: ['unlock', 'open'],
  description: 'Unmute the group',
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  cooldown: 5,

  async execute({ sock, msg, jid, isBotAdmin }) {
    if (!isBotAdmin) {
      return sock.sendMessage(jid, { text: '❌ I need to be an admin to unmute the group.' }, { quoted: msg });
    }

    await sock.groupSettingUpdate(jid, 'not_announcement');
    await Group.findOneAndUpdate({ jid }, { muted: false }, { upsert: true });
    await sock.sendMessage(jid, { text: `🔊 *Group Unmuted!*\nAll members can send messages.\n\n${FOOTER}` }, { quoted: msg });
  },
};
