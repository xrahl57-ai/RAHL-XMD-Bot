import Group from '../../database/models/Group.js';
import { FOOTER } from '../../utils/helpers.js';

export default {
  name: 'antilink',
  aliases: ['nolink'],
  description: 'Toggle anti-link protection',
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  cooldown: 5,

  async execute({ sock, msg, jid, args }) {
    const group = await Group.findOne({ jid }).lean();
    const action = args[0]?.toLowerCase();
    const current = group?.antilink || false;
    const newState = action === 'on' ? true : action === 'off' ? false : !current;

    await Group.findOneAndUpdate({ jid }, { antilink: newState }, { upsert: true });
    await sock.sendMessage(jid, {
      text: `🔗 *Anti-Link:* ${newState ? '✅ ON' : '❌ OFF'}\n${newState ? 'WhatsApp group links will be removed.' : 'Links are now allowed.'}\n\n${FOOTER}`,
    }, { quoted: msg });
  },
};
