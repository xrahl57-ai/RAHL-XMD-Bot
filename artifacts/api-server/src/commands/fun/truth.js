const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const TRUTHS = [
  "What's the most embarrassing thing that's happened to you in public? 😳",
  "What's the biggest lie you've ever told and gotten away with? 🤥",
  "What's something you pretend to like but actually hate? 😬",
  "Have you ever had a crush on someone in this group? If yes — who? 👀",
  "What's the most childish thing you still do? 👶",
  "What's the worst date you've ever been on? Story time. 💔",
  "What's something you're deeply ashamed of that you've never told anyone? 🤫",
  "Have you ever stalked someone's social media for more than 30 minutes straight? Be honest. 📱",
  "What's the pettiest thing you've ever done to get revenge on someone? 😤",
  "What's the most embarrassing thing in your search history right now? 🔍",
  "Who in your life do you secretly think is annoying but pretend to like? 🙂",
  "What's the most money you've spent on something completely stupid? 💸",
  "Have you ever ghosted someone you actually liked? What happened? 👻",
  "What's a habit you have that you'd be embarrassed if people found out about? 😶",
  "What's the last thing that made you cry — and were you alone? 😢",
  "Have you ever said 'I love you' to someone you didn't actually love? 💔",
  "What's the biggest mistake you've made in a relationship? 🥀",
  "What's something you want to say to someone in this group but never have? 💬",
  "What's the most illegal thing you've ever done? You don't have to be specific. 😅",
  "When was the last time you pretended to be busy to avoid someone? Who was it? 📵",
  "What's the most embarrassing thing you've done for someone you liked? 🥴",
  "If your texts from today were read aloud in this chat, how bad would it be? 1-10? 📲",
  "Have you ever blamed someone else for something you did? What was it? 😬",
  "What's a secret talent or hobby you've never told anyone about? 🎭",
  "What's one thing about yourself that you work hard to hide from people? 🪞",
];

export default {
  name: 'truth',
  aliases: ['t'],
  description: 'Get a random truth question',
  category: 'fun',
  cooldown: 5,

  async execute({ sock, msg, jid }) {
    await sock.sendMessage(jid, {
      text: `🔍 *TRUTH!*\n\n💬 ${pick(TRUTHS)}\n\n_Too scary? Try .dare instead_\n\n⚡ _RAHL XMD_`,
    }, { quoted: msg });
  },
};
