import axios from 'axios';

export default {
  name: 'translate',
  aliases: ['tr', 'tl'],
  description: 'Translate text to another language',
  category: 'utility',
  cooldown: 5,

  async execute({ sock, msg, jid, args, fullArgs }) {
    if (!fullArgs || args.length < 2) {
      return sock.sendMessage(jid, {
        text:
          `❌ *Usage:* .translate <lang> <text>\n` +
          `🌐 *Example:* .translate es Hello World\n\n` +
          `🗂️ *Common codes:* en · es · fr · de · ar · sw · zh · hi · pt`,
      }, { quoted: msg });
    }

    const targetLang = args[0];
    const text       = args.slice(1).join(' ');

    try {
      const res = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`,
        { timeout: 8000 },
      );

      const translated = res.data[0].map(i => i[0]).join('');
      const detected   = res.data[2] || 'auto';

      await sock.sendMessage(jid, {
        text:
          `╔══════════════════════╗\n` +
          `║  🌐  *TRANSLATOR*  🌐  ║\n` +
          `╚══════════════════════╝\n\n` +
          `🔤 *From* ➜ \`${detected.toUpperCase()}\`\n` +
          `🎯 *To* ➜ \`${targetLang.toUpperCase()}\`\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `📝 *Original:*\n_${text}_\n\n` +
          `✅ *Translated:*\n${translated}\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `⚡ _RAHL XMD Translator_ 🌍`,
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ *Translation failed*\n\n_${err.message}_\n\n_Check the language code and try again._`,
      }, { quoted: msg });
    }
  },
};
