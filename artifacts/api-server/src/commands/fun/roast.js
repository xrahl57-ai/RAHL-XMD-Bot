import { buildJid, getJidNumber } from '../../utils/helpers.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const ROASTS = [
  (t) => `🔥 ${t}, you're the human equivalent of a participation trophy.`,
  (t) => `😂 ${t} I'd roast you harder but my mom told me not to burn trash.`,
  (t) => `💀 ${t}, if brains were petrol, you wouldn't have enough to power an ant's motorcycle.`,
  (t) => `🤣 You're not stupid, ${t}. You just have really bad luck thinking.`,
  (t) => `😭 ${t}, I've seen better arguments in a shampoo bottle.`,
  (t) => `🔥 ${t}, you're the reason why the instruction manual on shampoo says "lather, rinse, repeat."`,
  (t) => `💀 ${t}, I'd call you an idiot but that would be an insult to idiots everywhere.`,
  (t) => `😂 ${t}, you have your entire life to be an idiot. Why waste today?`,
  (t) => `🤣 ${t}, you're like a cloud. When you disappear it's a beautiful day.`,
  (t) => `😤 ${t}, if I had a dollar for every smart thing you said, I'd be completely broke.`,
  (t) => `🔥 ${t}, you're proof that even evolution makes mistakes.`,
  (t) => `💀 ${t}, the only way you could be less relevant is if you were invisible too.`,
  (t) => `😂 ${t}, somewhere out there, a tree is working very hard to produce oxygen for you. Apologise to it.`,
  (t) => `🤣 ${t}, you are the human version of autocorrect — always wrong at the worst possible moment.`,
  (t) => `😭 ${t}, I'd explain it to you slowly but I ran out of crayons.`,
  (t) => `🔥 ${t}, I was going to make a joke about you, but I see life already did that for me.`,
  (t) => `💀 ${t}, calling you average would be a compliment.`,
  (t) => `😂 ${t}, you're not completely useless. You can always serve as a bad example.`,
  (t) => `🤣 ${t}, I'd agree with you but then we'd both be wrong.`,
  (t) => `😤 ${t}, some people bring happiness wherever they go. You bring it whenever you go.`,
  (t) => `🔥 ${t}, I would roast you, but then RAHL XMD would charge a premium fee for cremation services.`,
  (t) => `💀 ${t}, you're like Monday — nobody is happy to see you coming.`,
  (t) => `😂 ${t}, even your reflection in the mirror takes a step back.`,
  (t) => `🤣 ${t}, I'd call you a tool but even tools are useful.`,
  (t) => `🔥 ${t}, your secrets are always safe with me. I never pay attention when you're talking anyway.`,
];

export default {
  name: 'roast',
  aliases: ['burn', 'diss'],
  description: 'Playfully roast someone',
  category: 'fun',
  cooldown: 3,

  async execute({ sock, msg, jid, args, sender, pushName }) {
    const target =
      msg.message?.extendedTextMessage?.contextInfo?.participant ||
      (args[0] ? buildJid(args[0].replace('@', '')) : null);

    if (!target) {
      return sock.sendMessage(jid, {
        text: `❌ Tag someone to roast!\n\n_Usage: .roast @user_`,
      }, { quoted: msg });
    }

    const targetTag = `@${getJidNumber(target)}`;

    await sock.sendMessage(jid, {
      text:
        `╔══════════════════════╗\n` +
        `║  🔥  *ROAST ALERT*  🔥  ║\n` +
        `╚══════════════════════╝\n\n` +
        `${pick(ROASTS)(targetTag)}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `😂 _No hard feelings — it's just fun!_\n` +
        `🎭 _RAHL XMD Roasters_ ⚡`,
      mentions: [target],
    }, { quoted: msg });
  },
};
