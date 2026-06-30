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
  (s, t) => `🍵 *${s}* makes ${t} tea, wraps them in a blanket, and cuddles up beside them.\n_Peak comfort. Nothing else exists right now._ ☕🤍`,
  (s, t) => `🌊 *${s}* cuddles ${t} the way the sea holds the shore — always there, always gentle.\n_Feel it?_ 💙`,
  (s, t) => `🎵 *${s}* puts on soft music and cuddles ${t} without saying a word.\n_This is the good life. Right here._ 🎶🛋️`,
  (s, t) => `🦋 *${s}* floats over to ${t} and nestles in for the cosiest cuddle session.\n_Rating: ★★★★★ Would cuddle again._ 😌`,
  (s, t) => `🌼 *${t}*, *${s}* has claimed the spot beside you permanently.\n_Cuddle access granted. Indefinitely._ 🫂`,
  (s, t) => `🍀 *${s}* cuddles ${t} on a rainy day with nothing but warmth and quiet between them.\n_This is what peace feels like._ 🌧️💚`,
  (s, t) => `🌙 *${s}* whispers "close your eyes" to ${t} and wraps around them like a dream.\n_You're in good hands now._ ✨`,
  (s, t) => `🐻 *${s}* initiates a world-record-length cuddle with ${t}.\n_Judges are impressed. ${t} is comfortable. All is well._ 🏆`,
  (s, t) => `🫀 *${s}* cuddles ${t} so sincerely it could be felt three rooms away.\n_That's the power level we're working with._ 💜`,
  (s, t) => `☀️ *${s}* greets ${t} with a morning cuddle before the day starts.\n_Today is already better because of this._ 🌅💛`,
  (s, t) => `🎁 *${t}* — your cuddle from *${s}* has been loaded and is now active.\n_Duration: unlimited. Energy cost: zero._ 🛋️`,
  (s, t) => `🌈 *${s}* wraps ${t} in a cuddle so warm it changed the weather outside.\n_Currently: sunny. Reason: obvious._ ☀️`,
  (s, t) => `🕯️ *${s}* cuddles ${t} by candlelight and doesn't say a single word.\n_Sometimes silence is the most loving thing._ 🤍`,
  (s, t) => `🥹 *${s}* pulls ${t} in for a cuddle and just… holds on.\n_"I've got you." Three words. Infinite weight._ 💜`,
  (s, t) => `🌿 *${s}* cuddles ${t} like nature cuddles the earth — slowly, completely, everywhere at once.\n_You are held._ 🌿🤍`,
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
