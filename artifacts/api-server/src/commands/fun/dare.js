const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const DARES = [
  "Send the last photo in your gallery to this chat. No deleting. 📸",
  "Text your most recent contact 'I think you're really cute' and screenshot the response. 😬",
  "Change your WhatsApp status to 'I lost a dare' for 24 hours. 😂",
  "Send a voice note singing happy birthday to nobody in particular. 🎂🎵",
  "Tag someone in this chat and tell them something you genuinely admire about them. 💛",
  "Send a photo of your current screen to the group right now. No clearing it first. 📱",
  "Tell the group your most embarrassing childhood memory. In detail. 😭",
  "Do 15 push-ups and send a voice note counting every single one. 💪",
  "Post an embarrassing childhood photo in this chat. 👶",
  "Text someone 'We need to talk' and don't reply for 10 minutes. Then screenshot. 😈",
  "Record yourself doing your best celebrity impression and send it. 🎬",
  "Write the alphabet backwards and send it as a voice note. No mistakes allowed. 🔤",
  "Tell the group the last lie you told — and who you told it to. 🤥",
  "Send a message to your crush right now. Show the group what you typed. 💌",
  "Call someone in your contact list, say 'I need help. The penguins are watching me.' then hang up. 🐧",
  "Reveal the last thing you searched on Google. Screenshot it. 🔍",
  "Go one hour without using your phone — and tell us what you did with your hands. ⏰",
  "Send a voice note speaking only in a silly voice for 30 seconds about your day. 🎤",
  "Post a photo of your shoes right now, wherever they are. 👟",
  "Tell the group three things you've never told anyone. 🤫",
  "Compliment every single person in this chat by name. Every. Single. One. 💬",
  "Change your profile picture to something random from your gallery for 1 hour. 🖼️",
  "Send a voice note beatboxing for at least 20 seconds. 🥁",
  "Tell the group who your celebrity crush is. Full name. No lying. 😏",
  "Write a 3-sentence short story about the last person who messaged you. 📖",
];

export default {
  name: 'dare',
  aliases: ['d'],
  description: 'Get a random dare',
  category: 'fun',
  cooldown: 5,

  async execute({ sock, msg, jid }) {
    await sock.sendMessage(jid, {
      text: `😈 *DARE!*\n\n🎯 ${pick(DARES)}\n\n_Do it or choose truth with .truth_\n\n⚡ _RAHL XMD_`,
    }, { quoted: msg });
  },
};
