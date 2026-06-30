const OUTCOMES = [
  { result: 'HEADS', emoji: '🪙', side: '👑 The crowned side' },
  { result: 'TAILS', emoji: '🔄', side: '⬛ The plain side' },
];

const COMMENTS_HEADS = [
  "Heads! The crown wins today. 👑",
  "Heads it is! Fortune favours the bold.",
  "HEADS! Royalty has spoken. 👑",
  "It's Heads! The universe has decided.",
  "Heads! Some days just work out.",
];

const COMMENTS_TAILS = [
  "Tails! The coin had other plans. 🔄",
  "Tails. Flip again if you dare.",
  "TAILS! The underdog wins this round.",
  "It's Tails! Not what you expected? 😅",
  "Tails. Take it or challenge fate.",
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default {
  name: 'coinflip',
  aliases: ['flip', 'coin', 'cf'],
  description: 'Flip a coin',
  category: 'fun',
  cooldown: 2,

  async execute({ sock, msg, jid }) {
    const isHeads = Math.random() < 0.5;
    const outcome = isHeads ? OUTCOMES[0] : OUTCOMES[1];
    const comment = isHeads ? pick(COMMENTS_HEADS) : pick(COMMENTS_TAILS);

    await sock.sendMessage(jid, {
      text:
        `🪙 *Coin Flip*\n\n` +
        `${outcome.emoji} *Result: ${outcome.result}!*\n` +
        `${outcome.side}\n\n` +
        `💬 _${comment}_\n\n` +
        `⚡ _RAHL XMD_`,
    }, { quoted: msg });
  },
};
