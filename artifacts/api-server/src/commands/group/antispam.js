import Group from '../../database/models/Group.js';
import { FOOTER } from '../../utils/helpers.js';

export default {
  name: 'antispam',
  aliases: ['nospam'],
  description: 'Toggle anti-spam protection',
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  cooldown: 5,

  async execute({ sock, msg, jid, args }) {
    const group = await Group.findOne({ jid }).lean();
    const current = group?.antispam || false;
    const action = args[0]?.toLowerCase();
    const newState = action === 'on' ? true : action === 'off' ? false : !current;

    await Group.findOneAndUpdate({ jid }, { antispam: newState }, { upsert: true });
    await sock.sendMessage(jid, {
      text: `🛡️ *Anti-Spam:* ${newState ? '✅ ON' : '❌ OFF'}\n${newState ? 'Spam messages will be removed.' : 'Spam protection disabled.'}\n\n${FOOTER}`,
    }, { quoted: msg });
  },
};
