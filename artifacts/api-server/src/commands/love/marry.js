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
  (s, t) => `🎩 *${s}* shows up at ${t}'s door with a ring, flowers, and a rehearsed speech.\n_The speech? "Marry me." That's it. Short and final._ 😤💍`,
  (s, t) => `🕊️ *${s}* ties a ring to a dove and sends it flying to ${t}.\n_Romantic? Yes. Practical? Absolutely not. Worth it? 100%._ 🐦💍`,
  (s, t) => `🌅 *${s}* picks the perfect sunset moment to ask ${t} the biggest question.\n_"Will you be mine forever?" The answer better be yes._ 🌇💍`,
  (s, t) => `🌹 *${s}* fills the room with roses and whispers to ${t}:\n_"Every flower here represents a reason I want to marry you. I ran out of room."_ 💍`,
  (s, t) => `💍 *${s}* → ${t}: "I've thought about this carefully for approximately five seconds and I am absolutely certain.\n_Marry me."_ 😂❤️`,
  (s, t) => `🎆 *${s}* writes "MARRY ME ${t.toUpperCase()}?" in fireworks across the sky!\n_Subtle? No. Effective? We'll see._ 🎇💍`,
  (s, t) => `🎵 *${s}* hires a full orchestra to serenade ${t} before dropping to one knee.\n_"I know this is extra. I am extra. We match."_ 🎶💍`,
  (s, t) => `🏖️ *${s}* waits until ${t} is relaxed on the beach, then proposes in the sand.\n_${s} wrote it with a stick. ${t} said yes before finishing the question._ 💍🌊`,
  (s, t) => `💍 *${s}* has been planning this proposal for exactly 0 seconds.\n_"${t}, marry me." Unplanned. Unfiltered. Completely real._ 🥺`,
  (s, t) => `🌙 *${s}* proposes to ${t} under the stars with nothing but honesty.\n_"I don't have fancy words. Just this ring and the truth: you're it for me."_ 💍✨`,
  (s, t) => `🥹 *${s}* trembles slightly, takes a breath, and looks at ${t}:\n_"I'm terrified. But being without you scares me more. Please. Marry me."_ 💍`,
  (s, t) => `📜 *${s}* presents ${t} with a 47-page document titled "Reasons to Marry Me."\n_Page 1: "Because I love you." Pages 2-47: elaboration._ 😂💍`,
  (s, t) => `🎁 *${s}* hands ${t} a box. Inside is a ring, a note, and a photo of them together.\n_The note says: "This is my favourite picture. You make everywhere look like home."_ 💍🤍`,
  (s, t) => `👑 *${s}* to ${t}: "I'm not perfect. I will be late sometimes. I'll forget things.\n_But I will never forget you. Marry me?"_ 💍`,
  (s, t) => `🔥 *${s}* → ${t}: "If the universe gave me infinite chances, I'd choose you every single time.\n_One ring. One question. One answer I'm hoping for."_ 💍❤️‍🔥`,
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
