import OpenAI from 'openai';
import axios from 'axios';
import { config } from '../../config/config.js';
import { FOOTER } from '../../utils/helpers.js';

export default {
  name: 'imagine',
  aliases: ['imagine', 'dalle', 'image'],
  description: 'Generate an AI image (requires OpenAI key)',
  category: 'ai',
  cooldown: 30,

  async execute({ sock, msg, jid, fullArgs }) {
    if (!fullArgs) {
      return sock.sendMessage(jid, {
        text: `🎨 Usage: .imagine <description>\nExample: .imagine a futuristic city at sunset\n\n${FOOTER}`,
      }, { quoted: msg });
    }

    if (!config.openaiKey) {
      return sock.sendMessage(jid, {
        text: `❌ Image generation requires OPENAI_API_KEY in .env\n\n${FOOTER}`,
      }, { quoted: msg });
    }

    await sock.sendMessage(jid, { react: { text: '🎨', key: msg.key } });
    await sock.sendMessage(jid, { text: `🎨 Generating image for: "${fullArgs}"...\n\n${FOOTER}` }, { quoted: msg });

    try {
      const openai = new OpenAI({ apiKey: config.openaiKey });
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: fullArgs,
        n: 1,
        size: '1024x1024',
      });

      const imageUrl = response.data[0].url;
      const imageRes = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
      const buffer = Buffer.from(imageRes.data);

      await sock.sendMessage(jid, {
        image: buffer,
        caption: `🎨 *AI Generated Image*\n\n📝 Prompt: ${fullArgs}\n\n${FOOTER}`,
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ Image generation failed: ${err.message}\n\n${FOOTER}`,
      }, { quoted: msg });
    }
  },
};
