import { exec } from 'child_process';
import { FOOTER } from '../../utils/helpers.js';

export default {
  name: 'exec',
  aliases: ['bash', 'shell', 'cmd'],
  description: 'Execute shell commands (Owner only)',
  category: 'owner',
  ownerOnly: true,
  cooldown: 5,

  async execute({ sock, msg, jid, fullArgs }) {
    if (!fullArgs) {
      return sock.sendMessage(jid, { text: `❌ Usage: .exec <command>\n\n${FOOTER}` }, { quoted: msg });
    }

    exec(fullArgs, { timeout: 10000 }, async (err, stdout, stderr) => {
      const output = stdout || stderr || err?.message || 'No output';
      await sock.sendMessage(jid, {
        text: `💻 *Shell Output:*\n\`\`\`\n${output.slice(0, 2000)}\n\`\`\`\n\n${FOOTER}`,
      }, { quoted: msg });
    });
  },
};
