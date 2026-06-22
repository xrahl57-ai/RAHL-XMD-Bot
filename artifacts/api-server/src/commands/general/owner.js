import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from '../../config/config.js';
import { FOOTER } from '../../utils/helpers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OWNER_IMG = join(__dirname, '../../assets/owner.jpg');

export default {
  name: 'owner',
  aliases: ['contact'],
  description: 'Display owner information',
  category: 'general',
  cooldown: 10,

  async execute({ sock, msg, jid }) {
    const text = `╔══════════════════════╗
║    👑 *RAHL XMD* 👑    ║
╚══════════════════════╝

👑 *Owner Name:* ${config.ownerName}
📱 *Owner Number:* ${config.ownerNumber}
🤖 *Bot Name:* ${config.botName}
📦 *Version:* ${config.version}

💬 DM the owner directly:
wa.me/${config.ownerNumber}

${FOOTER}`;

    if (existsSync(OWNER_IMG)) {
      const imageBuffer = readFileSync(OWNER_IMG);
      await sock.sendMessage(jid, { image: imageBuffer, caption: text }, { quoted: msg });
    } else {
      await sock.sendMessage(jid, { text }, { quoted: msg });
    }
  },
};
