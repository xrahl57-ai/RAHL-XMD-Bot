import { buildJid, getJidNumber } from '../../utils/helpers.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const MESSAGES = [
  (s, t) => `🛋️ *${s}* curls up next to ${t} and cuddles in silence.\n_No words needed. Just warmth._ 🤍`,
  (s, t) => `🌙 *${s}* wraps around ${t} like a blanket on a cold night!\n_You are officially the comfiest person alive, ${t}_ 😌`,
  (s, t) => `☁️ *${s}* pulls ${t} close and cuddles up tight!\n_This is a no-judgment zone. Just peace and good vibes._ 🕊️`,
  (s, t) => `🫶 *${s}* cuddles ${t} so softly the whole world went quiet for a second.\n_That's how powerful this moment is._ ✨`,
  (s, t) => `🌸 *${t}* — *${s}* wants you to know you're getting the premium cuddle treatment tonight!\n_Pillows, warmth, and zero worries included_ 💤`,
  (s, t) => `🤗 *${s}* sneaks behind ${t} and wraps both arms around them!\n_"Stay like this forever please" — ${s}_ 💛`,
  (s, t) => `🌺 *${s}* and ${t} are now officially in full cuddle mode.\n_Do not disturb. This is sacred._ 🙏`,
  (s, t) => `💜 *${s}* cuddles ${t} and whispers "you're safe here."\n_And just like that, everything feels lighter_ 🌤️`,
  (s, t) => `🌟 *${s}* offers ${t} the world's most healing cuddle.\n_Scientifically proven to cure 99% of bad days_ 🔬💛`,
  (s, t) => `🎀 *${s}* → ${t}: one deluxe cuddle, delivered with love.\n_No returns. You're keeping this one._ 🛋️`,
];

export default {
  name: 'cuddle',
  aliases: ['snuggle'],
  description: 'Cuddle someone',
  category: 'love',
  cooldown: 3,

  async execute({ sock, msg, jid, args, sender, pushName }) {
    const target =
      msg.message?.extendedTextMessage?.contextInfo?.participant ||
      (args[0] ? buildJid(args[0].replace('@', '')) : null);

    if (!target) {
      return sock.sendMessage(jid, {
        text: `❌ Tag someone to cuddle!\n\n_Usage: .cuddle @user_`,
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
