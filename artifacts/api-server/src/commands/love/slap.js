import { buildJid, getJidNumber } from '../../utils/helpers.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const MESSAGES = [
  (s, t) => `👋 *${s}* SLAPS ${t} with a giant fish!\n_No fish were harmed. ${t} on the other hand..._ 🐟😂`,
  (s, t) => `💥 *${s}* hits ${t} with the most dramatic slow-motion slap!\n_The whole chat felt that._ 😆`,
  (s, t) => `👊 *${s}* playfully bonks ${t} on the head!\n_Ouch? Probably deserved tbh._ 😂`,
  (s, t) => `🌊 *${s}* slaps ${t} with a wet noodle!\n_Why a noodle? Nobody knows. Iconic move._ 🍜💀`,
  (s, t) => `👋 *${s}* sneaks up and gives ${t} a surprise slap!\n_${t} didn't see it coming. Nobody did._ 😭💀`,
  (s, t) => `🔥 *${s}* delivers the legendary RAHL slap to ${t}!\n_This slap has been blessed. Handle with care._ 😤👑`,
  (s, t) => `💫 *${s}* winds up and launches the world's most dramatic slap at ${t}!\n_The sound echoed in three dimensions._ 👀`,
  (s, t) => `😤 *${s}* gives ${t} a firm but loving tap on the cheek.\n_Translation: "Get yourself together. I believe in you."_ 💛`,
  (s, t) => `👋 *${s}* slaps ${t} so hard the Wi-Fi disconnected for a second.\n_Reconnected. But ${t} is still shook._ 😂`,
  (s, t) => `🥊 *${s}* challenges ${t} to a playful slap battle!\n_${t} is already losing just from reading this._ 💀`,
];

export default {
  name: 'slap',
  aliases: ['bonk', 'smack'],
  description: 'Playfully slap someone',
  category: 'love',
  cooldown: 3,

  async execute({ sock, msg, jid, args, sender, pushName }) {
    const target =
      msg.message?.extendedTextMessage?.contextInfo?.participant ||
      (args[0] ? buildJid(args[0].replace('@', '')) : null);

    if (!target) {
      return sock.sendMessage(jid, {
        text: `❌ Tag someone to slap!\n\n_Usage: .slap @user_`,
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
