import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { config } from '../../config/config.js';
import { FOOTER } from '../../utils/helpers.js';

export default {
  name: 'explain',
  aliases: ['describe', 'define'],
  description: 'Explain a concept with AI',
  category: 'ai',
  cooldown: 8,

  async execute({ sock, msg, jid, fullArgs }) {
    if (!fullArgs) {
      return sock.sendMessage(jid, {
        text: `📚 Usage: .explain <concept>\nExample: .explain blockchain technology\n\n${FOOTER}`,
      }, { quoted: msg });
    }

    await sock.sendMessage(jid, { react: { text: '📚', key: msg.key } });

    const prompt = `Explain the following in simple, clear terms with examples: ${fullArgs}`;

    try {
      let response = '';

      if (config.geminiKey) {
        const genAI = new GoogleGenerativeAI(config.geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        response = result.response.text();
      } else if (config.openaiKey) {
        const openai = new OpenAI({ apiKey: config.openaiKey });
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
        });
        response = completion.choices[0].message.content;
      } else {
        return sock.sendMessage(jid, {
          text: `❌ No AI API key configured.\n\n${FOOTER}`,
        }, { quoted: msg });
      }

      await sock.sendMessage(jid, {
        text: `📚 *Explanation*\n\n🔍 *Topic:* ${fullArgs}\n\n${response.slice(0, 3000)}\n\n${FOOTER}`,
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ Explain failed: ${err.message}\n\n${FOOTER}`,
      }, { quoted: msg });
    }
  },
};
