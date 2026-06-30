export default {
  name: 'setdesc',
  aliases: ['desc', 'groupdesc', 'setdescription'],
  description: 'Change the group description',
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  cooldown: 10,

  async execute({ sock, msg, jid, fullArgs, isBotAdmin }) {
    if (!isBotAdmin) {
      return sock.sendMessage(jid, {
        text: `❌ I need to be an admin to change the group description.`,
      }, { quoted: msg });
    }

    const newDesc = fullArgs || '';

    try {
      await sock.groupUpdateDescription(jid, newDesc);
      await sock.sendMessage(jid, {
        text:
          `╔══════════════════════╗\n` +
          `║  📝  *GROUP DESC*  📝   ║\n` +
          `╚══════════════════════╝\n\n` +
          `✅ *Description updated!*\n\n` +
          `📄 *New Description:*\n${newDesc || '_[Cleared]_'}\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `⚡ _RAHL XMD_ 🦅`,
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ *Failed to update description*\n\n_${err.message}_`,
      }, { quoted: msg });
    }
  },
};
