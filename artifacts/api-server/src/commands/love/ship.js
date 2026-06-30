import { buildJid, getJidNumber } from '../../utils/helpers.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function getCompatibility() {
  const pct = Math.floor(Math.random() * 41) + 60; // 60–100%
  const bar  = '█'.repeat(Math.floor(pct / 10)) + '░'.repeat(10 - Math.floor(pct / 10));
  return { pct, bar };
}

const VERDICTS = [
  (pct) => pct >= 90 ? '🔥 SOULMATES! This was written in the stars.' : '',
  (pct) => pct >= 80 ? '💞 Very strong match! These two just *work*.' : '',
  (pct) => pct >= 70 ? '💛 Good vibes! There's definitely something here.' : '',
  (pct) => pct >= 60 ? '🌱 Potential is there. Give it time.' : '',
].find(fn => fn !== undefined);

const SHIP_NAMES = [
  (a, b) => a.slice(0, Math.ceil(a.length / 2)) + b.slice(Math.floor(b.length / 2)),
  (a, b) => b.slice(0, Math.ceil(b.length / 2)) + a.slice(Math.floor(a.length / 2)),
  (a, b) => a.slice(0, 2) + b.slice(-2),
];

const COMMENTS = [
  'The algorithm has spoken. Congratulations (or condolences).',
  'RAHL XMD has done the math and the math is romantic.',
  'These numbers never lie. Trust the process.',
  'The compatibility engine ran 47 simulations. This is the result.',
  'Science, feelings, and a little bit of chaos say so.',
  'Based on vibes, energy, and absolutely nothing else.',
  'The universe whispered. RAHL XMD listened.',
  'Statistical anomaly? Or destiny? You decide.',
];

export default {
  name: 'ship',
  aliases: ['couple', 'compatibility'],
  description: 'Ship two people together',
  category: 'love',
  cooldown: 5,

  async execute({ sock, msg, jid, args, sender, pushName }) {
    // .ship @user1 @user2  OR  .ship @user  (pairs them with sender)
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    let person1Jid, person2Jid;

    if (mentioned.length >= 2) {
      [person1Jid, person2Jid] = mentioned;
    } else if (mentioned.length === 1) {
      person1Jid = sender;
      person2Jid = mentioned[0];
    } else if (args.length >= 2) {
      person1Jid = buildJid(args[0].replace('@', ''));
      person2Jid = buildJid(args[1].replace('@', ''));
    } else if (args.length === 1) {
      person1Jid = sender;
      person2Jid = buildJid(args[0].replace('@', ''));
    } else {
      return sock.sendMessage(jid, {
        text: `❌ Tag two people to ship!\n\n_Usage: .ship @user1 @user2_\n_Or: .ship @user (ships with you)_`,
      }, { quoted: msg });
    }

    const n1 = getJidNumber(person1Jid);
    const n2 = getJidNumber(person2Jid);
    const name1 = `@${n1}`;
    const name2 = `@${n2}`;

    const { pct, bar } = getCompatibility();

    // Generate ship name from numbers (first few digits)
    const a = n1.slice(0, 4);
    const b = n2.slice(0, 4);
    const shipName = pick(SHIP_NAMES)(a, b).toUpperCase();

    const verdict =
      pct >= 90 ? '🔥 SOULMATES — written in the stars!' :
      pct >= 80 ? '💞 Strong match — these two just *work*.' :
      pct >= 70 ? '💛 Good vibes — there\'s definitely something here.' :
                  '🌱 Potential is there — give it time.';

    const comment = pick(COMMENTS);

    const text =
      `╔══════════════════╗\n` +
      `  💘 *RAHL XMD SHIP*\n` +
      `╚══════════════════╝\n\n` +
      `👤 *Person 1:* ${name1}\n` +
      `👤 *Person 2:* ${name2}\n\n` +
      `💑 *Ship Name:* \`${shipName}\`\n\n` +
      `📊 *Compatibility:* ${pct}%\n` +
      `[${bar}]\n\n` +
      `${verdict}\n\n` +
      `💬 _${comment}_\n\n` +
      `⚡ _RAHL XMD_`;

    await sock.sendMessage(jid, {
      text,
      mentions: [person1Jid, person2Jid],
    }, { quoted: msg });
  },
};
