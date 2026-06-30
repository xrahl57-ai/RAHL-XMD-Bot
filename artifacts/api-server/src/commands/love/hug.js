import { buildJid, getJidNumber } from '../../utils/helpers.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const MESSAGES = [
  (s, t) => `🤗 *${s}* just wrapped ${t} in the warmest hug ever!\n_You feeling it? Because that was straight from the heart_ 💞`,
  (s, t) => `💛 *${s}* sneaks up behind ${t} and squeezes tight!\n_No letting go for at least 10 seconds_ 🤗`,
  (s, t) => `🫂 *${s}* pulls ${t} into a bear hug so big it cures all bad vibes!\n_Consider yourself recharged_ ⚡💛`,
  (s, t) => `🌸 *${t}* — *${s}* just sent you the coziest hug in the world!\n_Wrap yourself in it like a blanket_ 🛋️`,
  (s, t) => `💫 *${s}* dashes across the room and leaps into a full hug with ${t}!\n_Pure chaos. Pure love._ 🤍`,
  (s, t) => `🤗 *${s}* hugs ${t} tight and won't let go!\n_"You are loved whether you know it or not" — ${s}_ 💕`,
  (s, t) => `☀️ *${s}* sends ${t} a sunrise hug — the kind that says everything will be okay.\n_Feel better already?_ 🌅`,
  (s, t) => `🌼 *${t}*, you've been hugged by *${s}*!\n_Science says hugs reduce stress. This one's a double dose_ 🔬💛`,
  (s, t) => `🫶 *${s}* wraps both arms around ${t} and refuses to move.\n_This hug is rated ∞/10. No notes._ 🤗`,
  (s, t) => `💌 *${s}* → ${t}: *HUG DELIVERED* 🤗\n_Signed, sealed, and squeezed with love_ 💝`,
  (s, t) => `🌙 *${s}* gives ${t} a goodnight hug that lasts forever.\n_Sleep easy. You are cared for._ ✨`,
  (s, t) => `🎀 *${s}* offers ${t} a hug so powerful it fixes everything wrong today.\n_No charge. Take as many as you need._ 💜`,
  (s, t) => `🌊 *${s}* hugs ${t} like the ocean — deep, endless, and full of warmth.\n_Let that sink in._ 🌊💙`,
  (s, t) => `🦋 *${t}* just received an emergency comfort hug from *${s}*!\n_Prescription: one hug, twice daily, side effects include smiling_ 😌`,
  (s, t) => `✨ *${s}* sees ${t} and immediately opens arms wide.\n_No words. Just the hug. That's enough._ 🫂`,
  (s, t) => `🍀 *${s}* surprises ${t} with a hug completely out of nowhere!\n_"I just felt like you needed one" — ${s}_ 💚`,
  (s, t) => `🎵 *${s}* hugs ${t} to the beat of their favourite song.\n_Soft. Warm. Exactly what was needed._ 🎶💛`,
  (s, t) => `🏡 *${s}* → ${t}: "You are my safe place, so here's a hug from mine to yours."\n_Take it. Keep it._ 🤗`,
  (s, t) => `🌺 *${t}*, *${s}* just queued you a hug for every hard day you'll ever have.\n_They're pre-loaded. Ready to go._ 💖`,
  (s, t) => `🕊️ *${s}* wraps ${t} in the gentlest hug — no pressure, no questions, just presence.\n_Sometimes that's all we need._ 🤍`,
  (s, t) => `🥹 *${s}* hugs ${t} so hard a single tear appears.\n_The good kind. Definitely the good kind._ 💛`,
  (s, t) => `⭐ *${s}* beams across the chat and crashes into ${t} with a full body hug!\n_Unstoppable. Iconic. 10/10 would hug again._ 🤗`,
  (s, t) => `🌈 *${s}* sends ${t} a rainbow hug — warm from start to finish.\n_Consider your whole week improved._ 🌈💕`,
  (s, t) => `🫀 *${s}* holds ${t} close and whispers: "You matter more than you know."\n_Then squeezes even tighter._ 💜`,
  (s, t) => `🎁 *${t}* — today's gift from *${s}* is a hug with no expiry date.\n_Store it somewhere safe. Use whenever._ 🤗✨`,
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
