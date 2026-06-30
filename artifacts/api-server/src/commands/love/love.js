import { buildJid, getJidNumber } from '../../utils/helpers.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const MESSAGES = [
  (s, t) => `❤️ *${s}* loves ${t} more than words can say!\n_You make every day brighter just by existing._ 🌟`,
  (s, t) => `💖 *${s}* → ${t}: "You are my favourite person in every universe."\n_And yes, they mean it._ ✨`,
  (s, t) => `🌹 *${s}* wants the whole chat to know — ${t} is everything.\n_Absolutely everything._ 💫`,
  (s, t) => `💝 *${s}* loves ${t} the way the moon loves the night sky.\n_Quietly. Constantly. Without needing a reason._ 🌙`,
  (s, t) => `🔥 *${s}* has a confession: "${t}, I think about you every single day."\n_There. It's out now._ 💌`,
  (s, t) => `💞 *${s}* chooses ${t} — yesterday, today, and every tomorrow.\n_No conditions. No fine print._ 🫶`,
  (s, t) => `🌸 *${s}* → ${t}: "If love was a playlist, you'd be every song."\n_On repeat. Forever._ 🎵`,
  (s, t) => `💘 *${s}* loves ${t} so deeply it doesn't even have a name for it.\n_It just… is._ 🌊`,
  (s, t) => `🌺 *${s}* tells ${t}: "You make this world make sense."\n_And that's the rarest gift anyone can give._ 🙏`,
  (s, t) => `❤️‍🔥 *${s}* is absolutely, completely, irreversibly in love with ${t}.\n_This message has been approved by the heart department._ 💼❤️`,
  (s, t) => `💫 *${s}* loves ${t} more than coffee in the morning, and that's saying everything._ ☕💕`,
  (s, t) => `🫀 *${s}* → ${t}: "My favourite notification will always be yours."_ 📱❤️`,
];

export default {
  name: 'love',
  aliases: ['iloveyou', 'ily'],
  description: 'Express love to someone',
  category: 'love',
  cooldown: 3,

  async execute({ sock, msg, jid, args, sender, pushName }) {
    const target =
      msg.message?.extendedTextMessage?.contextInfo?.participant ||
      (args[0] ? buildJid(args[0].replace('@', '')) : null);

    if (!target) {
      return sock.sendMessage(jid, {
        text: `❌ Tag someone to love!\n\n_Usage: .love @user_`,
      }, { quoted: msg });
    }

    const senderName = pushName || getJidNumber(sender);
    const targetTag  = `@${getJidNumber(target)}`;

    await sock.sendMessage(jid, {
      text: pick(MESSAGES)(senderName, targetTag),
      mentions: [target],
    }, { quoted: msg });
  },
};
