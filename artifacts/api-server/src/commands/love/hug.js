import { buildJid, getJidNumber } from '../../utils/helpers.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const MESSAGES = [
  (s, t) => `🤗 *${s}* just wrapped ${t} in the warmest hug ever!\n_You feeling it? Because that was straight from the heart_ 💞`,
  (s, t) => `💛 *${s}* sneaks up behind ${t} and squeezes tight!\n_No letting go for at least 10 seconds_ 🤗`,
  (s, t) => `🫂 *${s}* pulls ${t} into a bear hug so big it cures all bad vibes!\n_Consider yourself recharged_ ⚡💛`,
  (s, t) => `🌸 *${t}* — *${s}* just sent you the coziest hug in the world!\n_Wrap yourself in it like a blanket_ 🛋️`,
  (s, t) => `💫 *${s}* dashes across the room and leaps into a full hug with ${t}!\n_Pure chaos. Pure love._ 🤍`,
  (s, t) => `🤗 *${s}* hugs ${t} tight and won't let go!\n_"You are loved whether you know it or not" — ${s}_ 💕`,
  (s, t) => `☀️ *${s}* sends ${t} a sunrise hug — the kind that says everything will be okay_ 🌅\n_Feel better already?_`,
  (s, t) => `🌼 *${t}*, you've been hugged by *${s}*!\n_Science says hugs reduce stress. This one's a double dose_ 🔬💛`,
  (s, t) => `🫶 *${s}* wraps both arms around ${t} and refuses to move.\n_This hug is rated ∞/10. No notes._ 🤗`,
  (s, t) => `💌 *${s}* → ${t}: *HUG DELIVERED* 🤗\n_Signed, sealed, and squeezed with love_ 💝`,
];

export default {
  name: 'hug',
  aliases: ['embrace'],
  description: 'Hug someone',
  category: 'love',
  cooldown: 3,

  async execute({ sock, msg, jid, args, sender, pushName }) {
    const target =
      msg.message?.extendedTextMessage?.contextInfo?.participant ||
      (args[0] ? buildJid(args[0].replace('@', '')) : null);

    if (!target) {
      return sock.sendMessage(jid, {
        text: `❌ Tag someone to hug!\n\n_Usage: .hug @user_`,
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
