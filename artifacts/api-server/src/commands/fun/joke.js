const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const JOKES = [
  "Why don't scientists trust atoms?\nBecause they make up everything! 😂",
  "I told my wife she was drawing her eyebrows too high.\nShe looked surprised. 😆",
  "Why can't you give Elsa a balloon?\nBecause she'll let it go! ❄️😂",
  "What do you call a fake noodle?\nAn Impasta! 🍝😂",
  "Why did the scarecrow win an award?\nBecause he was outstanding in his field! 🌾😄",
  "I'm reading a book about anti-gravity.\nIt's impossible to put down! 📚😂",
  "Why do cows wear bells?\nBecause their horns don't work! 🐄😄",
  "What do you call cheese that isn't yours?\nNacho cheese! 🧀😂",
  "Why couldn't the bicycle stand up by itself?\nBecause it was two-tired! 🚲😂",
  "What do you call a sleeping dinosaur?\nA dino-snore! 🦕😴",
  "Why did the math book look so sad?\nBecause it had too many problems! 📐😂",
  "What do you call a fish without eyes?\nA fsh! 🐟😂",
  "Why did the golfer bring extra pants?\nIn case he got a hole in one! ⛳😄",
  "What's a vampire's favourite fruit?\nA blood orange! 🧛🍊",
  "Why don't eggs tell jokes?\nThey'd crack each other up! 🥚😂",
  "What did the ocean say to the beach?\nNothing. It just waved! 🌊😄",
  "Why did the tomato turn red?\nBecause it saw the salad dressing! 🍅😂",
  "What do you call a sleeping bull?\nA bulldozer! 🐂😄",
  "Why was the broom late?\nIt swept in! 🧹😂",
  "What do you call a pig that does karate?\nA pork chop! 🐷🥋",
  "Why don't skeletons fight each other?\nThey don't have the guts! 💀😂",
  "What do you call a factory that makes OK products?\nA satisfactory! 😄",
  "Why did the picture go to jail?\nBecause it was framed! 🖼️😂",
  "What do you call a bear with no teeth?\nA gummy bear! 🐻😂",
  "Why did the invisible man turn down the job offer?\nHe couldn't see himself doing it! 👻😂",
  "What's brown and sticky?\nA stick! 🪵😂",
  "Why did the stadium get hot after the game?\nAll the fans left! 🏟️😄",
  "What do you call a cold dog?\nA chilli dog! 🐶❄️",
  "I only know 25 letters of the alphabet.\nI don't know why! 😂",
  "Why did the computer go to the doctor?\nBecause it had a virus! 💻🤧",
  "What do you call a snowman with a six-pack?\nAn abdominal snowman! ☃️💪",
  "Why did the cookie go to hospital?\nBecause it felt crummy! 🍪😂",
];

export default {
  name: 'joke',
  aliases: ['jok', 'funny'],
  description: 'Get a random joke',
  category: 'fun',
  cooldown: 3,

  async execute({ sock, msg, jid }) {
    await sock.sendMessage(jid, {
      text:
        `╔══════════════════════╗\n` +
        `║   😂  *JOKE TIME*  😂   ║\n` +
        `╚══════════════════════╝\n\n` +
        `${pick(JOKES)}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🎭 _RAHL XMD Fun Zone_ ⚡`,
    }, { quoted: msg });
  },
};
