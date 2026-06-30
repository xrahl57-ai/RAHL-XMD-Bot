import { buildJid, getJidNumber } from '../../utils/helpers.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const MESSAGES = [
  (s, t) => `💋 *${s}* blows a kiss straight to ${t}!\n_Caught it? Good. Keep it forever._ 😘`,
  (s, t) => `😘 *${s}* plants the sweetest kiss on ${t}'s cheek!\n_Blushing is optional but expected_ 🌸`,
  (s, t) => `💋 *${t}* — *${s}* just kissed you on the forehead.\n_That means: "You are precious and I mean it."_ 👑`,
  (s, t) => `🌹 *${s}* closes their eyes and kisses ${t} softly.\n_The whole chat just collectively went "awww"_ 💕`,
  (s, t) => `😚 *${s}* sneaks a little kiss on ${t}'s cheek and runs away!\n_Speed ✅. Cuteness ✅. No regrets ✅_ 💨`,
  (s, t) => `💋 *${s}* sends ${t} a kiss through the screen!\n_Click to receive it. One time only. You're welcome._ 😘`,
  (s, t) => `🌷 *${t}*, get ready — *${s}* is coming in for a kiss!\n_Brace yourself. It's a sweet one._ 😙`,
  (s, t) => `✨ *${s}* kisses ${t} on the hand like royalty.\n_Because that's exactly how ${t} deserves to be treated._ 👸`,
  (s, t) => `😘 *${s}* → ${t}: 💋💋💋\n_Three kisses. One for each way you make my day better._ 🌟`,
  (s, t) => `💋 *${s}* blows a gigantic kiss at ${t}!\n_It's floating across the chat right now. Catch it!_ 🎈`,
];

export default {
  name: 'kiss',
  aliases: ['smooch'],
  description: 'Kiss someone',
  category: 'love',
  cooldown: 3,

  async execute({ sock, msg, jid, args, sender, pushName }) {
    const target =
      msg.message?.extendedTextMessage?.contextInfo?.participant ||
      (args[0] ? buildJid(args[0].replace('@', '')) : null);

    if (!target) {
      return sock.sendMessage(jid, {
        text: `❌ Tag someone to kiss!\n\n_Usage: .kiss @user_`,
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
