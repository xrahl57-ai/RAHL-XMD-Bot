import { buildJid, getJidNumber } from '../../utils/helpers.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const MESSAGES = [
  (s, t) => `😏 *${s}* slides into the conversation and locks eyes with ${t}.\n_"Hey. Just thought you should know you're everything."_ 😌`,
  (s, t) => `🌹 *${s}* to ${t}: "Are you a charger? Because I've been looking for you all day."_ ⚡😘`,
  (s, t) => `😏 *${s}* looks at ${t} and says:\n_"I was having a normal day until you showed up and ruined my focus."_ 💀❤️`,
  (s, t) => `✨ *${s}* → ${t}: "Your smile should be illegal. It keeps distracting me."_ 😵💫`,
  (s, t) => `😏 *${s}* casually tells ${t}: "I googled 'perfection' and your contact came up."_ 📱😂`,
  (s, t) => `💫 *${s}* flirts with ${t} by simply making eye contact and smiling.\n_No words needed. That did everything._ 😍`,
  (s, t) => `🌙 *${s}* → ${t}: "Do you have a map? I keep getting lost in the thought of you."_ 🗺️😘`,
  (s, t) => `😏 *${s}* sends ${t} a message: "You + me + good music + no plans = perfection?"_ 🎵✨`,
  (s, t) => `🔥 *${s}* to ${t}: "Honest question — how are you this effortlessly amazing?"_ 👀💛`,
  (s, t) => `💘 *${s}* catches ${t}'s eye across the chat and simply says:\n_"So… what are we doing about this?"_ 😏`,
  (s, t) => `🌺 *${s}* → ${t}: "I wasn't going to say anything but honestly? You're kind of everything."_ 🥺`,
  (s, t) => `😉 *${s}* flirts with ${t} by sending them this flirt command and watching what happens next.\n_Bold strategy. Respect._ 👀🎯`,
  (s, t) => `🌊 *${s}* to ${t}: "You're the kind of person songs get written about.\n_Just saying. No pressure."_ 🎶😏`,
  (s, t) => `☕ *${s}* → ${t}: "Are you coffee? Because I can't start my day without thinking about you."_ ☕😘`,
  (s, t) => `🎯 *${s}* aims directly at ${t}'s heart and says:\n_"I think about you way more than I should. And I don't plan to stop."_ 💘`,
  (s, t) => `🌸 *${s}* tells ${t}: "I've met a lot of people. But you? You're different.\n_Not in a weird way. In the best way."_ 😌✨`,
  (s, t) => `😎 *${s}* casually drops this on ${t}: "I'm not great at subtlety, so I'll just say it — I like you a lot."\n_Very smooth. Maximum damage._ 💥`,
  (s, t) => `🌙 *${s}* → ${t}: "If being attractive was a crime, you'd be doing life.\n_I'm prepared to be your lawyer."_ 😂💋`,
  (s, t) => `🦋 *${s}* gets butterflies just thinking about ${t} and decides to say something:\n_"You make everything feel lighter. Is that you or just the effect you have?"_ 💛`,
  (s, t) => `🎪 *${s}* → ${t}: "I've been trying to think of something clever to say.\n_Nothing compares to how I feel, so I'll just say that instead."_ 🥺😏`,
  (s, t) => `🌹 *${s}* leans in and tells ${t}: "Every time you talk, I forget what I was going to say.\n_You're that distracting."_ 😵‍💫`,
  (s, t) => `✈️ *${s}* → ${t}: "If you were a destination, I'd never book a return flight."_ ✈️😘`,
  (s, t) => `🌟 *${s}* to ${t}: "I'm usually the funniest person in the room.\n_But somehow you make me nervous and I forget all my jokes."_ 😂💛`,
  (s, t) => `🫦 *${s}* → ${t}: "You live in my head rent-free and I've decided to let you stay."_ 😏❤️`,
  (s, t) => `🎶 *${s}* serenades ${t} with the energy of someone who has absolutely nothing to lose:\n_"I'd rather embarrass myself trying than wonder what could have been."_ 🎵🔥`,
];

export default {
  name: 'flirt',
  aliases: ['rizz'],
  description: 'Flirt with someone',
  category: 'love',
  cooldown: 3,

  async execute({ sock, msg, jid, args, sender, pushName }) {
    const target =
      msg.message?.extendedTextMessage?.contextInfo?.participant ||
      (args[0] ? buildJid(args[0].replace('@', '')) : null);

    if (!target) {
      return sock.sendMessage(jid, {
        text: `❌ Tag someone to flirt with!\n\n_Usage: .flirt @user_`,
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
