import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { config } from '../../config/config.js';
import { FOOTER } from '../../utils/helpers.js';

export default {
  name: 'ai',
  aliases: ['ask', 'chat', 'gpt'],
  description: 'Chat with AI assistant',
  category: 'ai',
  cooldown: 8,

  async execute({ sock, msg, jid, fullArgs }) {
    if (!fullArgs) {
      return sock.sendMessage(jid, {
        text: `🤖 Usage: .ai <question>\nExample: .ai What is quantum computing?\n\n${FOOTER}`,
      }, { quoted: msg });
    }

    await sock.sendMessage(jid, { react: { text: '🤖', key: msg.key } });

    try {
      let response = '';

      if (config.geminiKey) {
        const genAI = new GoogleGenerativeAI(config.geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(fullArgs);
        response = result.response.text();
      } else if (config.openaiKey) {
        const openai = new OpenAI({ apiKey: config.openaiKey });
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: fullArgs }],
          max_tokens: 1000,
        });
        response = completion.choices[0].message.content;
      } else {
        return sock.sendMessage(jid, {
          text: `❌ No AI API key configured. Please set GEMINI_API_KEY or OPENAI_API_KEY in .env\n\n${FOOTER}`,
        }, { quoted: msg });
      }

      await sock.sendMessage(jid, {
        text: `🤖 *RAHL AI*\n\n❓ *Question:* ${fullArgs}\n\n💬 *Answer:* ${response}\n\n${FOOTER}`,
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ AI Error: ${err.message}\n\n${FOOTER}`,
      }, { quoted: msg });
    }
  },
};
