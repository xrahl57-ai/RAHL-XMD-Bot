const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const ANSWERS = [
  // Positive
  { text: "It is certain.", emoji: "✅" },
  { text: "It is decidedly so.", emoji: "✅" },
  { text: "Without a doubt.", emoji: "✅" },
  { text: "Yes, definitely.", emoji: "✅" },
  { text: "You may rely on it.", emoji: "✅" },
  { text: "As I see it, yes.", emoji: "✅" },
  { text: "Most likely.", emoji: "✅" },
  { text: "Outlook good.", emoji: "✅" },
  { text: "Yes.", emoji: "✅" },
  { text: "Signs point to yes.", emoji: "✅" },
  // Neutral
  { text: "Reply hazy, try again.", emoji: "🔮" },
  { text: "Ask again later.", emoji: "🔮" },
  { text: "Better not tell you now.", emoji: "🔮" },
  { text: "Cannot predict now.", emoji: "🔮" },
  { text: "Concentrate and ask again.", emoji: "🔮" },
  // Negative
  { text: "Don't count on it.", emoji: "❌" },
  { text: "My reply is no.", emoji: "❌" },
  { text: "My sources say no.", emoji: "❌" },
  { text: "Outlook not so good.", emoji: "❌" },
  { text: "Very doubtful.", emoji: "❌" },
];

export default {
  name: '8ball',
  aliases: ['magic8', 'ask', 'eightball'],
  description: 'Ask the magic 8-ball a question',
  category: 'fun',
  cooldown: 3,

  async execute({ sock, msg, jid, fullArgs }) {
    if (!fullArgs) {
      return sock.sendMessage(jid, {
        text: `🎱 Ask me a yes/no question!\n\n_Usage: .8ball Will I win today?_`,
      }, { quoted: msg });
    }

    const answer = pick(ANSWERS);
    await sock.sendMessage(jid, {
      text: `🎱 *Magic 8-Ball*\n\n❓ *Question:* ${fullArgs}\n\n${answer.emoji} *Answer:* _${answer.text}_\n\n⚡ _RAHL XMD_`,
    }, { quoted: msg });
  },
};
