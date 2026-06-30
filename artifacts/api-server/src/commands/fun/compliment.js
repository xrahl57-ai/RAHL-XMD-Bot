import { buildJid, getJidNumber } from '../../utils/helpers.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const COMPLIMENTS = [
  (t) => `✨ ${t}, you have the kind of energy that makes every room feel lighter.`,
  (t) => `💛 ${t}, you are more appreciated than you will ever know.`,
  (t) => `🌟 ${t}, your presence genuinely makes a difference.`,
  (t) => `💖 ${t}, whoever has you in their life is lucky. Genuinely.`,
  (t) => `🌸 ${t}, you carry yourself with a grace that not many people have.`,
  (t) => `🔥 ${t}, honestly? You're one of a kind and the world is better for it.`,
  (t) => `💫 ${t}, you make hard things look easy and that's actually incredible.`,
  (t) => `🌺 ${t}, your kindness is the kind that doesn't go unnoticed.`,
  (t) => `✨ ${t}, you have this rare quality of making people feel seen and heard.`,
  (t) => `💛 ${t}, your smile is genuinely contagious. Don't underestimate that.`,
  (t) => `🌟 ${t}, you think in ways most people can't. That's a superpower.`,
  (t) => `💖 ${t}, you are so much stronger than you give yourself credit for.`,
  (t) => `🌸 ${t}, the world becomes a better place every time you show up.`,
  (t) => `🔥 ${t}, your potential is actually limitless and I hope you know that.`,
  (t) => `💫 ${t}, there's something about you that's just genuinely refreshing.`,
  (t) => `🌺 ${t}, you are doing better than you think. I promise.`,
  (t) => `✨ ${t}, your laugh should be protected at all costs. It's that good.`,
  (t) => `💛 ${t}, you have a warmth that people are drawn to naturally.`,
  (t) => `🌟 ${t}, watching you grow has been one of the best things to witness.`,
  (t) => `💖 ${t}, you handle things with so much grace and it shows.`,
  (t) => `🌸 ${t}, you make being yourself look absolutely effortless.`,
  (t) => `🔥 ${t}, your energy is the kind that changes the whole atmosphere.`,
  (t) => `💫 ${t}, I don't think you fully realise how genuinely impressive you are.`,
  (t) => `🌺 ${t}, you are exactly the kind of person the world needs more of.`,
  (t) => `✨ ${t}, you give the best kind of energy — the kind that stays with people long after you leave.`,
];

export default {
  name: 'compliment',
  aliases: ['praise', 'comp'],
  description: 'Compliment someone',
  category: 'fun',
  cooldown: 3,

  async execute({ sock, msg, jid, args, sender, pushName }) {
    const target =
      msg.message?.extendedTextMessage?.contextInfo?.participant ||
      (args[0] ? buildJid(args[0].replace('@', '')) : null);

    if (!target) {
      return sock.sendMessage(jid, {
        text: `❌ Tag someone to compliment!\n\n_Usage: .compliment @user_`,
      }, { quoted: msg });
    }

    const targetTag = `@${getJidNumber(target)}`;

    await sock.sendMessage(jid, {
      text:
        `👑══════════════════════👑\n` +
        `    💖  *COMPLIMENT*  💖\n` +
        `👑══════════════════════👑\n\n` +
        `${pick(COMPLIMENTS)(targetTag)}\n\n` +
        `✦══════════════════════✦\n` +
        `🌸 _Spread love, not hate!_\n` +
        `💫 _RAHL XMD Vibes_ ⚡`,
      mentions: [target],
    }, { quoted: msg });
  },
};
