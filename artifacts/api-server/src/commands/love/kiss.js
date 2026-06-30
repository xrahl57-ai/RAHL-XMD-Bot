import { buildJid, getJidNumber } from '../../utils/helpers.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const MESSAGES = [
  (s, t) => `💋 *${s}* blows a kiss straight to ${t}!\n_Caught it? Good. Keep it forever._ 😘`,
  (s, t) => `😘 *${s}* plants the sweetest kiss on ${t}'s cheek!\n_Blushing is optional but expected_ 🌸`,
  (s, t) => `💋 *${t}* — *${s}* just kissed you on the forehead.\n_That means: "You are precious and I mean it."_ 👑`,
  (s, t) => `🌹 *${s}* closes their eyes and kisses ${t} softly.\n_The whole chat just collectively went "awww"_ 💕`,
  (s, t) => `😚 *${s}* sneaks a little kiss on ${t}'s cheek and runs away!\n_Speed ✅ Cuteness ✅ No regrets ✅_ 💨`,
  (s, t) => `💋 *${s}* sends ${t} a kiss through the screen!\n_Click to receive it. One time only. You're welcome._ 😘`,
  (s, t) => `🌷 *${t}*, get ready — *${s}* is coming in for a kiss!\n_Brace yourself. It's a sweet one._ 😙`,
  (s, t) => `✨ *${s}* kisses ${t} on the hand like royalty.\n_Because that's exactly how ${t} deserves to be treated._ 👸`,
  (s, t) => `😘 *${s}* → ${t}: 💋💋💋\n_Three kisses. One for each way you make my day better._ 🌟`,
  (s, t) => `💋 *${s}* blows a gigantic kiss at ${t}!\n_It's floating across the chat right now. Catch it!_ 🎈`,
  (s, t) => `🫦 *${s}* steals a quick kiss from ${t} and acts like nothing happened.\n_${t} knows. The chat knows. Everyone knows._ 😂💋`,
  (s, t) => `🌙 *${s}* places a soft goodnight kiss on ${t}'s forehead.\n_Sleep well. You've been kissed with kindness._ 🌙✨`,
  (s, t) => `🎠 *${s}* twirls around and plants a perfect kiss on ${t}'s cheek!\n_Cinematic. Iconic. Unforgettable._ 🎬💋`,
  (s, t) => `🌺 *${s}* kisses ${t} so gently the whole room goes quiet.\n_That kind of moment. That exact one._ 🤍`,
  (s, t) => `💘 *${t}* — *${s}* just sent you the kind of kiss that stays with you all day.\n_You'll feel it. Trust._ 😌`,
  (s, t) => `🍬 *${s}* kisses ${t} on the nose!\n_Sweet. Small. Completely adorable._ 😊💋`,
  (s, t) => `💫 *${s}* runs across the room and surprise-kisses ${t}'s cheek!\n_The audacity? Incredible. The result? Beautiful._ 😂❤️`,
  (s, t) => `🎶 *${s}* leans in and whispers a song into ${t}'s ear, then kisses their cheek.\n_Two gifts in one. You're welcome, ${t}._ 🎵💋`,
  (s, t) => `🍀 *${s}* sends ${t} a lucky kiss!\n_They say a kiss from ${s} can fix a bad day. Science agrees._ 🔬😘`,
  (s, t) => `🌊 *${s}* kisses ${t} the way the tide kisses the shore — softly, repeatedly, without end.\n_That's the one._ 💙`,
  (s, t) => `🎁 *${t}*, *${s}* wrapped a kiss in a bow just for you.\n_Handle with care. It's fragile because it's real._ 💋🎀`,
  (s, t) => `🥂 *${s}* raises a toast and seals it with a kiss to ${t}.\n_Here's to you. Always._ 😘✨`,
  (s, t) => `🦋 *${s}* gives ${t} a butterfly kiss — eyelashes and all.\n_The softest thing that exists._ 🌸💋`,
  (s, t) => `🌈 *${s}* throws a kiss to ${t} that travels through every colour of the rainbow.\n_Arrives full of warmth._ 🌈😘`,
  (s, t) => `🫀 *${s}* kisses ${t} right where the heart is.\n_"You are deeply, completely, wonderfully loved." — ${s}_ 💋❤️`,
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
