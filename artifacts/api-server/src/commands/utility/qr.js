import QRCode from 'qrcode';
import { FOOTER } from '../../utils/helpers.js';

export default {
  name: 'qr',
  aliases: ['qrcode', 'makeqr'],
  description: 'Generate a QR code from text',
  category: 'utility',
  cooldown: 5,

  async execute({ sock, msg, jid, fullArgs }) {
    if (!fullArgs) {
      return sock.sendMessage(jid, {
        text: `❌ Usage: .qr <text or link>\n\n${FOOTER}`,
      }, { quoted: msg });
    }

    try {
      const qrBuffer = await QRCode.toBuffer(fullArgs, {
        type: 'png',
        errorCorrectionLevel: 'H',
        margin: 2,
        scale: 8,
        color: { dark: '#7B2FBE', light: '#FFFFFF' },
      });

      await sock.sendMessage(jid, {
        image: qrBuffer,
        caption: `📱 *QR Code Generated*\n\n📝 Content: ${fullArgs.slice(0, 100)}\n\n${FOOTER}`,
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ Failed to generate QR: ${err.message}\n\n${FOOTER}`,
      }, { quoted: msg });
    }
  },
};
