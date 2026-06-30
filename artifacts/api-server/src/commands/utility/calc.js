export default {
  name: 'calc',
  aliases: ['calculate', 'math', 'c'],
  description: 'Calculate a math expression',
  category: 'utility',
  cooldown: 2,

  async execute({ sock, msg, jid, fullArgs }) {
    if (!fullArgs) {
      return sock.sendMessage(jid, {
        text: `❌ Usage: .calc <expression>\n\nExamples:\n  .calc 2 + 2\n  .calc 15% of 200\n  .calc (100 * 3) / 4`,
      }, { quoted: msg });
    }

    try {
      // Normalise "X% of Y" → (X/100)*Y
      let expr = fullArgs
        .replace(/(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)/gi, '($1/100)*$2')
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**');

      // Safety: allow only digits, operators, parens, spaces, decimals
      if (!/^[\d\s\+\-\*\/\(\)\.\%\,]+$/.test(expr)) {
        throw new Error('Invalid characters in expression');
      }

      // Safe eval via Function (expression already sanitised above)
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${expr})`)();

      if (!isFinite(result)) throw new Error('Result is undefined (division by zero?)');

      const formatted = Number.isInteger(result) ? result : parseFloat(result.toFixed(10));

      await sock.sendMessage(jid, {
        text:
          `╔══════════════════════╗\n` +
          `║  🧮  *CALCULATOR*  🧮  ║\n` +
          `╚══════════════════════╝\n\n` +
          `📝 *Expression:*\n\`${fullArgs}\`\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `✅ *Result:*\n\`${formatted}\`\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `⚡ _RAHL XMD Calculator_ 🦅`,
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text:
          `❌ *Invalid Expression*\n\n` +
          `💥 _${err.message}_\n\n` +
          `💡 *Tip:* Use  +  −  ×  ÷  ( )  %`,
      }, { quoted: msg });
    }
  },
};
