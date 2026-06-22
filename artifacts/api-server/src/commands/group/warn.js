import Warning from '../../database/models/Warning.js';
import { buildJid, getJidNumber, FOOTER } from '../../utils/helpers.js';

const MAX_WARNS = 3;

export default {
  name: 'warn',
  aliases: ['warning'],
  description: 'Warn a member (auto-kick at 3 warns)',
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  cooldown: 5,

  async execute({ sock, msg, jid, args, sender, isBotAdmin }) {
    let target = msg.message?.extendedTextMessage?.contextInfo?.participant ||
      (args[0] ? buildJid(args[0].replace('@', '')) : null);
    const reason = args.slice(1).join(' ') || 'No reason given';

    if (!target) {
      return sock.sendMessage(jid, { text: `❌ Usage: .warn @user [reason]\n\n${FOOTER}` }, { quoted: msg });
    }

    const warning = await Warning.findOneAndUpdate(
      { jid: target, groupJid: jid },
      {
        $inc: { count: 1 },
        $push: { reasons: reason },
        warnedBy: sender,
        lastWarn: new Date(),
      },
      { upsert: true, new: true },
    );

    const warnCount = warning.count;

    if (warnCount >= MAX_WARNS && isBotAdmin) {
      await sock.groupParticipantsUpdate(jid, [target], 'remove');
      await Warning.findOneAndDelete({ jid: target, groupJid: jid });
      return sock.sendMessage(jid, {
        text: `⛔ @${getJidNumber(target)} has been *kicked* after receiving *${MAX_WARNS} warnings*.\n\n${FOOTER}`,
        mentions: [target],
      }, { quoted: msg });
    }

    await sock.sendMessage(jid, {
      text: `⚠️ *Warning ${warnCount}/${MAX_WARNS}* — @${getJidNumber(target)}\n📝 Reason: ${reason}\n${warnCount >= MAX_WARNS - 1 ? '\n🚨 Next warn = Kick!' : ''}\n\n${FOOTER}`,
      mentions: [target],
    }, { quoted: msg });
  },
};
