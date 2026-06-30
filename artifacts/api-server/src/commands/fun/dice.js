const DICE_EMOJI = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const COMMENTS = [
  "The dice have spoken. Accept your fate.",
  "A clean roll! Take it and run.",
  "Fate has delivered its verdict.",
  "The universe threw that one for you.",
  "That's your number. Make the most of it.",
  "Lucky? Unlucky? Only you know.",
  "RAHL XMD's dice never lie.",
  "Roll again? Or live with it?",
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default {
  name: 'dice',
  aliases: ['roll', 'rolldice', 'die'],
  description: 'Roll a dice',
  category: 'fun',
  cooldown: 2,

  async execute({ sock, msg, jid, args }) {
    // Support custom sides: .dice 20 (for a D20 etc.)
    const sides = Math.min(Math.max(parseInt(args[0]) || 6, 2), 100);
    const roll  = Math.floor(Math.random() * sides) + 1;

    // Use unicode dice emoji for standard d6, otherwise show number
    const display = sides === 6 ? `${DICE_EMOJI[roll]} (${roll})` : `🎲 ${roll}`;

    await sock.sendMessage(jid, {
      text:
        `🎲 *Dice Roll* ${sides > 6 ? `(D${sides})` : ''}\n\n` +
        `${display}\n\n` +
        `💬 _${pick(COMMENTS)}_\n\n` +
        `⚡ _RAHL XMD_`,
    }, { quoted: msg });
  },
};
