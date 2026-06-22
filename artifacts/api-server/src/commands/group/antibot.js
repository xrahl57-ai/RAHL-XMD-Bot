import Group from '../../database/models/Group.js';
import { FOOTER } from '../../utils/helpers.js';

export default {
  name: 'antibot',
  aliases: ['nobot'],
  description: 'Toggle anti-bot protection',
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  cooldown: 5,

  async execute({ sock, msg, jid, args }) {
    const group = await Group.findOne({ jid }).lean();
    const current = group?.antibot || false;
    const action = args[0]?.toLowerCase();
    const newState = action === 'on' ? true : action === 'off' ? false : !current;

    await Group.findOneAndUpdate({ jid }, { antibot: newState }, { upsert: true });
    await sock.sendMessage(jid, {
      text: `🤖 *Anti-Bot:* ${newState ? '✅ ON' : '❌ OFF'}\n${newState ? 'Bots will be removed automatically.' : 'Bots are now allowed.'}\n\n${FOOTER}`,
    }, { quoted: msg });
  },
};
