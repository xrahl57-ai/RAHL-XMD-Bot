import axios from 'axios';
import { FOOTER } from '../../utils/helpers.js';

export default {
  name: 'translate',
  aliases: ['tr', 'tl'],
  description: 'Translate text to another language',
  category: 'utility',
  cooldown: 5,

  async execute({ sock, msg, jid, args, fullArgs }) {
    if (!fullArgs || args.length < 2) {
      return sock.sendMessage(jid, {
        text: `❌ Usage: .translate <lang> <text>\nExample: .translate es Hello World\n\n${FOOTER}`,
      }, { quoted: msg });
    }

    const targetLang = args[0];
    const text = args.slice(1).join(' ');

    try {
      const res = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`,
        { timeout: 8000 },
      );

      const translated = res.data[0].map(item => item[0]).join('');
      const detected = res.data[2];

      await sock.sendMessage(jid, {
        text: `🌐 *Translation*\n\n📝 Original (${detected}): ${text}\n🔤 Translated (${targetLang}): ${translated}\n\n${FOOTER}`,
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ Translation failed: ${err.message}\n\n${FOOTER}`,
      }, { quoted: msg });
    }
  },
};
