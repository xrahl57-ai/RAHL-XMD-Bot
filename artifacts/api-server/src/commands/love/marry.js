import { buildJid, getJidNumber } from '../../utils/helpers.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const MESSAGES = [
  (s, t) => `💍 *${s}* goes down on one knee in front of ${t}!\n_"Will you marry me? Right here, right now, in this group chat?"_ 😭💍`,
  (s, t) => `👰 *${s}* has made a decision — ${t} is the one.\n_Ring ready. Heart ready. Absolutely terrified. Let's go._ 💍`,
  (s, t) => `💒 *${s}* proposes to ${t} with the confidence of someone who has ZERO backup plan!\n_${t}, please say yes. The whole chat is watching._ 👀`,
  (s, t) => `💍 *${s}* slides the ring across the chat to ${t}.\n_"I don't need a fancy dinner. I need YOU."_ 🥺❤️`,
  (s, t) => `🌹 *${s}* clears their throat and says:\n_"${t}, I want to annoy you for the rest of my life. Marry me."_ 😂💍`,
  (s, t) => `👑 *${s}* → ${t}: "You are my person. My always. My home.\n_Say yes and let's be chaotic together forever."_ 🔥💍`,
  (s, t) => `💍 *${s}* proposes to ${t} in the most sincere way possible:\n_"I can't imagine my story without you in every chapter."_ 📖💛`,
  (s, t) => `🥂 *${s}* raises a glass and says: "${t}, I choose you today and every day after.\n_Will you have me?"_ 💫`,
  (s, t) => `💌 *${s}* drops to one knee and presents ${t} with a ring and a love letter.\n_The letter just says "please" 47 times._ 😭💍`,
  (s, t) => `🎊 *${s}* PROPOSES TO ${t} IN FRONT OF EVERYONE!\n_The chat has never been this tense. What will ${t} say?_ 💍🎉`,
];

export default {
  name: 'marry',
  aliases: ['propose'],
  description: 'Propose to someone',
  category: 'love',
  cooldown: 5,

  async execute({ sock, msg, jid, args, sender, pushName }) {
    const target =
      msg.message?.extendedTextMessage?.contextInfo?.participant ||
      (args[0] ? buildJid(args[0].replace('@', '')) : null);

    if (!target) {
      return sock.sendMessage(jid, {
        text: `❌ Tag someone to propose to!\n\n_Usage: .marry @user_`,
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
