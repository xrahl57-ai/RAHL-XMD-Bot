export default {
  name: 'antidelete',
  aliases: ['antidel', 'ad'],
  description: 'Anti-delete status',
  category: 'security',
  cooldown: 5,

  async execute({ sock, msg, jid }) {
    await sock.sendMessage(jid, {
      text:
        `╔══════════════════╗\n` +
        `     🦅 *RAHL XMD*\n` +
        `╚══════════════════╝\n\n` +
        `🛡️ *ANTI-DELETE SYSTEM*\n\n` +
        `📊 *Status:* ALWAYS ACTIVE 🟢\n\n` +
        `📌 Anti-delete is globally enabled.\n` +
        `Every deleted message in any chat is automatically recovered — no setup needed.\n\n` +
        `⚡ _RAHL XMD_`,
    }, { quoted: msg });
  },
};
