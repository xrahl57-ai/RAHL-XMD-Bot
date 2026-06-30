const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const FACTS = [
  "Honey never spoils. Archaeologists have found 3,000-year-old honey in Egyptian tombs that was still edible. 🍯",
  "A day on Venus is longer than a year on Venus. It rotates so slowly it completes a full orbit before finishing one spin. 🌍",
  "Octopuses have three hearts, blue blood, and nine brains — one main brain and one in each arm. 🐙",
  "Bananas are technically berries, but strawberries are not. Botanically, a berry must develop from a single flower with one ovary. 🍌",
  "The human brain is approximately 73% water and only requires 2% dehydration to affect your attention and memory. 🧠",
  "A group of flamingos is called a flamboyance. That's the most fitting collective noun in existence. 🦩",
  "There are more possible iterations of a game of chess than there are atoms in the observable universe. ♟️",
  "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid. 🏛️",
  "The shortest war in history was between Britain and Zanzibar on August 27, 1896. Zanzibar surrendered after 38 minutes. ⚔️",
  "Wombat poop is cube-shaped. It's the only animal known to produce cubic droppings. 🐨",
  "There are more trees on Earth than stars in the Milky Way — roughly 3 trillion trees vs 100–400 billion stars. 🌳",
  "A single strand of spaghetti is called a 'spaghetto'. 🍝",
  "Oxford University is older than the Aztec Empire. Teaching began there around 1096 AD; the Aztec Empire started in 1428 AD. 📚",
  "The average person walks about 100,000 miles in their lifetime — roughly 4 times around the Earth. 🚶",
  "Sharks are older than trees. Sharks have existed for about 450 million years; trees appeared around 350 million years ago. 🦈",
  "A bolt of lightning contains enough energy to toast 100,000 slices of bread. ⚡",
  "Crows can recognise and remember human faces for years, and will hold grudges against people who wronged them. 🐦‍⬛",
  "The moon has moonquakes. They can last up to half an hour — far longer than most earthquakes. 🌙",
  "Butterflies can taste with their feet. Their taste sensors are in their legs, not their mouths. 🦋",
  "It would take about 1.2 million mosquitoes, each taking one sip, to drain all the blood from a human body. 🦟",
  "The inventor of the Pringles can, Fredric Baur, was so proud of his invention that he requested to be buried in one. His family honoured the request. 🥫",
  "Pistachios are technically fruits — specifically a type of drupe, the same family as peaches and cherries. 🌰",
  "Nintendo was founded in 1889. It originally made playing cards before becoming a video game company. 🎮",
  "A group of cats is called a clowder. A group of kittens is a kindle. 🐱",
  "The total weight of all ants on Earth is approximately equal to the total weight of all humans. 🐜",
  "Glass is actually a supercooled liquid, not a solid. It flows extremely slowly over very long periods of time. 🔬",
  "The human body contains enough iron to make a nail about 3 inches (7.5 cm) long. 🔩",
  "A group of porcupines is called a prickle. A group of owls is called a parliament. 🦔🦉",
  "Typing 'google.com' into Google's search bar and clicking search would cost Google money due to ad payments. 💻",
  "The sound of a whip crack is actually a small sonic boom — the tip of the whip breaks the sound barrier. 💥",
  "Polar bear fur is actually transparent, not white. It appears white because it reflects light. 🐻‍❄️",
  "There's a species of jellyfish that is biologically immortal. Turritopsis dohrnii can revert back to its juvenile form after reaching maturity. 🪼",
];

export default {
  name: 'fact',
  aliases: ['facts', 'didfact', 'didyouknow'],
  description: 'Get a random interesting fact',
  category: 'fun',
  cooldown: 3,

  async execute({ sock, msg, jid }) {
    await sock.sendMessage(jid, {
      text:
        `👑══════════════════════👑\n` +
        `   🔬  *DID YOU KNOW?*  🔬\n` +
        `👑══════════════════════👑\n\n` +
        `💡 ${pick(FACTS)}\n\n` +
        `✦══════════════════════✦\n` +
        `🧠 _RAHL XMD Knowledge_ ⚡`,
    }, { quoted: msg });
  },
};
