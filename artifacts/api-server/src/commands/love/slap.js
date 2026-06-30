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
  (s, t) => `🎭 *${s}* delivers a theatrical, slow-motion slap to ${t}'s cheek.\n_Oscar-worthy. Legendary. Will be talked about for years._ 🏆👋`,
  (s, t) => `🍳 *${s}* slaps ${t} with a spatula fresh from the kitchen.\n_Hot. Greasy. Completely unnecessary. Perfect._ 😂🍳`,
  (s, t) => `📚 *${s}* smacks ${t} upside the head with a textbook.\n_Chapter 1: Why you should think before you speak._ 😆📚`,
  (s, t) => `🐟 *${s}* pulls out a 5-foot salmon and absolutely demolishes ${t}.\n_${t} has been slapped into next week._ 💀🐟`,
  (s, t) => `👑 *${s}* slaps ${t} with the royal slipper!\n_By decree of RAHL XMD, this slap is official and binding._ 👑👋`,
  (s, t) => `🌬️ *${s}* charges up and delivers a slap so powerful it creates a breeze.\n_${t}'s hair is now perfectly messy._ 😤`,
  (s, t) => `🎯 *${s}* targets ${t} with pinpoint slap accuracy.\n_Direct hit. No apologies. Minor regrets._ 😂🎯`,
  (s, t) => `💥 *${s}* gives ${t} the "wake up" slap.\n_It's not mean. It's motivational. There's a difference._ 😌`,
  (s, t) => `🌪️ *${s}* summons a slap so fast it creates a small tornado around ${t}.\n_${t} is spinning. This was intentional._ 💀`,
  (s, t) => `🧤 *${s}* puts on a velvet glove and delivers the most dignified slap ${t} has ever received.\n_Classy. Devastating. Art._ 🎩`,
  (s, t) => `🍰 *${s}* slaps ${t} with an entire cake.\n_Now they're sweet AND knocked sideways. Efficiency._ 🎂😂`,
  (s, t) => `🤺 *${s}* dramatically challenges ${t} to a duel that begins and ends with one legendary slap.\n_Victory. Honour restored._ ⚔️`,
  (s, t) => `👋 *${s}* gives ${t} the softest, most passive-aggressive tap.\n_The audacity is in the subtlety. ${t} felt everything._ 😤`,
  (s, t) => `🎪 *${s}* performs a triple-spin backflip slap on ${t}!\n_The crowd goes wild. ${t} goes sideways._ 🎪💥`,
  (s, t) => `🌟 *${s}* slaps ${t} with so much love it barely even hurts.\n_...Okay it hurts a little. But lovingly._ 😂💛`,
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
