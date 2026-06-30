import QRCode from 'qrcode';

export default {
  name: 'qr',
  aliases: ['qrcode', 'makeqr'],
  description: 'Generate a QR code from text or link',
  category: 'utility',
  cooldown: 5,

  async execute({ sock, msg, jid, fullArgs }) {
    if (!fullArgs) {
      return sock.sendMessage(jid, {
        text:
          `❌ *Usage:* .qr <text or link>\n` +
          `📝 *Example:* .qr https://github.com`,
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

      const preview = fullArgs.length > 60 ? fullArgs.slice(0, 60) + '…' : fullArgs;

      await sock.sendMessage(jid, {
        image: qrBuffer,
        caption:
          `👑══════════════════════👑\n` +
          `    📱  *QR CODE*  📱\n` +
          `👑══════════════════════👑\n\n` +
          `✅ *QR Generated Successfully!*\n\n` +
          `📝 *Content* ➜ \`${preview}\`\n\n` +
          `✦══════════════════════✦\n` +
          `⚡ _RAHL XMD_ 🦅`,
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ *Failed to generate QR code*\n\n_${err.message}_`,
      }, { quoted: msg });
    }
  },
};
