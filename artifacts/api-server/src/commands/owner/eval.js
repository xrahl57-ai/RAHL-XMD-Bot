import { FOOTER } from '../../utils/helpers.js';

export default {
  name: 'eval',
  aliases: ['ev', 'evl'],
  description: 'Evaluate JavaScript code (Owner only)',
  category: 'owner',
  ownerOnly: true,
  cooldown: 3,

  async execute({ sock, msg, jid, fullArgs }) {
    if (!fullArgs) {
      return sock.sendMessage(jid, { text: `❌ Usage: .eval <code>\n\n${FOOTER}` }, { quoted: msg });
    }

    try {
      let result = eval(fullArgs);
      if (result instanceof Promise) result = await result;
      const output = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
      await sock.sendMessage(jid, {
        text: `✅ *Eval Result:*\n\`\`\`\n${output.slice(0, 2000)}\n\`\`\`\n\n${FOOTER}`,
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ *Eval Error:*\n\`\`\`\n${err.message}\n\`\`\`\n\n${FOOTER}`,
      }, { quoted: msg });
    }
  },
};
