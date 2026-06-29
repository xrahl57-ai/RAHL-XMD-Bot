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
    const ownerName = config.ownerName;
    const ownerNumber = config.ownerNumber.replace(/\D/g, '');

    const text = `╔══════════════════════╗
║    👑 *RAHL XMD* 👑    ║
╚══════════════════════╝

👑 *Owner:* ${ownerName}
📱 *Number:* +${ownerNumber}
🤖 *Bot:* ${config.botName}
📦 *Version:* ${config.version}

💬 _Tap the contact card below to DM the owner directly_

${FOOTER}`;

    // Build a WhatsApp vCard so the user can tap to message / save the owner
    const vcard =
      `BEGIN:VCARD\n` +
      `VERSION:3.0\n` +
      `FN:${ownerName}\n` +
      `TEL;type=CELL;type=VOICE;waid=${ownerNumber}:+${ownerNumber}\n` +
      `END:VCARD`;

    if (existsSync(OWNER_IMG)) {
      const imageBuffer = readFileSync(OWNER_IMG);
      await sock.sendMessage(jid, { image: imageBuffer, caption: text }, { quoted: msg });
    } else {
      await sock.sendMessage(jid, { text }, { quoted: msg });
    }

    // Send tappable contact card
    await sock.sendMessage(jid, {
      contacts: {
        displayName: ownerName,
        contacts: [{ vcard }],
      },
    });
  },
};
