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
  (s, t) => `💫 *${s}* loves ${t} more than coffee in the morning, and that's saying everything.\n_☕ = important. ${t} = more important._ 💕`,
  (s, t) => `🫀 *${s}* → ${t}: "My favourite notification will always be yours."\n_Doesn't matter when. Doesn't matter what. Always._ 📱❤️`,
  (s, t) => `🌙 *${s}* tells ${t}: "I love you in every language, including the ones that don't exist yet."\n_Still working on the translations._ 💜`,
  (s, t) => `🎆 *${s}* loves ${t} so much the stars noticed.\n_Three of them are named after this feeling right now._ ✨`,
  (s, t) => `🌊 *${s}* → ${t}: "You are the thing I didn't know I was looking for until I found you."\n_And now I can't look anywhere else._ 💙`,
  (s, t) => `🌼 *${s}* loves ${t} with everything they have, and then a little bit more.\n_The extra bit is the best part._ 💛`,
  (s, t) => `🏡 *${s}* → ${t}: "Home isn't a place. It's you. It has always been you."\n_Consider this a formal announcement._ 🤍`,
  (s, t) => `🦋 *${s}* feels butterflies every single time they think of ${t}.\n_Full swarm. Complete chaos. Zero complaints._ 💕`,
  (s, t) => `🌅 *${s}* loves ${t} like a sunrise — inevitable, breathtaking, and impossible to ignore.\n_Every. Single. Day._ ☀️❤️`,
  (s, t) => `🎸 *${s}* → ${t}: "If my life were a song, you'd be the chorus.\n_The part everyone remembers. The part that matters most."_ 🎵`,
  (s, t) => `🌿 *${s}* loves ${t} slowly and steadily, like a tree growing strong.\n_Rooted. Unwavering. Always there._ 🌳💚`,
  (s, t) => `🥹 *${s}* just looked at ${t} and felt everything at once.\n_"I love you" doesn't cover it. But it's a start._ ❤️`,
  (s, t) => `⭐ *${s}* → ${t}: "In every version of my life, I would find you.\n_That's not poetic. That's just facts."_ 💫`,
  (s, t) => `🎀 *${s}* wraps their love in a bow and hands it to ${t}.\n_No receipt. Non-refundable. Not taking it back._ 💝`,
  (s, t) => `🕊️ *${s}* loves ${t} the way peace loves silence — completely, and without trying.\n_It simply is._ 🤍`,
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
