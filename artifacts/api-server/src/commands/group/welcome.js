import Group from '../../database/models/Group.js';
import { FOOTER } from '../../utils/helpers.js';

export default {
  name: 'welcome',
  aliases: ['setwelcome'],
  description: 'Toggle or set welcome messages',
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  cooldown: 5,

  async execute({ sock, msg, jid, args, fullArgs }) {
    const group = await Group.findOne({ jid }).lean();
    const action = args[0]?.toLowerCase();

    if (action === 'on') {
      const customMsg = args.slice(1).join(' ');
      await Group.findOneAndUpdate(
        { jid },
        { welcome: true, welcomeMessage: customMsg || '' },
        { upsert: true },
      );
      return sock.sendMessage(jid, {
        text: `✅ *Welcome messages enabled!*\n${customMsg ? `📝 Custom message set.` : '📝 Using default message.'}\n\n${FOOTER}`,
      }, { quoted: msg });
    }

    if (action === 'off') {
      await Group.findOneAndUpdate({ jid }, { welcome: false }, { upsert: true });
      return sock.sendMessage(jid, { text: `❌ *Welcome messages disabled.*\n\n${FOOTER}` }, { quoted: msg });
    }

    const status = group?.welcome ? '✅ ON' : '❌ OFF';
    await sock.sendMessage(jid, {
      text: `👋 *Welcome System*\nStatus: ${status}\n\nUsage:\n• .welcome on [custom message]\n• .welcome off\n\n${FOOTER}`,
    }, { quoted: msg });
  },
};
