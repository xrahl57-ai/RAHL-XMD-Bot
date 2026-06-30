import { buildJid, getJidNumber } from '../../utils/helpers.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const MESSAGES = [
  (s, t) => `😏 *${s}* slides into ${t}'s DMs — wait, this IS the DM.\n_"Hey. Just thought you should know you're everything."_ 😌`,
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
  (s, t) => `😉 *${s}* flirts with ${t} by sending them this flirt command and watching what happens next_ 👀🎯`,
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
