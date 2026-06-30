export default {
  name: 'grouplink',
  aliases: ['invitelink', 'link', 'gl'],
  description: 'Get or reset the group invite link',
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  cooldown: 10,

  async execute({ sock, msg, jid, args, isBotAdmin }) {
    if (!isBotAdmin) {
      return sock.sendMessage(jid, {
        text: `❌ I need to be an admin to manage the invite link.`,
      }, { quoted: msg });
    }

    const action = (args[0] || '').toLowerCase();

    try {
      if (action === 'reset' || action === 'revoke') {
        await sock.groupRevokeInvite(jid);
        const newCode = await sock.groupInviteCode(jid);
        await sock.sendMessage(jid, {
          text:
            `╔══════════════════════╗\n` +
            `║  🔄  *LINK RESET*  🔄   ║\n` +
            `╚══════════════════════╝\n\n` +
            `✅ *Invite link has been reset!*\n\n` +
            `🔗 *New Link:*\nhttps://chat.whatsapp.com/${newCode}\n\n` +
            `⚠️ _Old link is now invalid._\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `⚡ _RAHL XMD_ 🦅`,
        }, { quoted: msg });
      } else {
        const code = await sock.groupInviteCode(jid);
        await sock.sendMessage(jid, {
          text:
            `╔══════════════════════╗\n` +
            `║  🔗  *GROUP LINK*  🔗   ║\n` +
            `╚══════════════════════╝\n\n` +
            `✅ *Invite Link:*\nhttps://chat.whatsapp.com/${code}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `💡 _To reset: .grouplink reset_\n` +
            `⚡ _RAHL XMD_ 🦅`,
        }, { quoted: msg });
      }
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ *Failed to get invite link*\n\n_${err.message}_`,
      }, { quoted: msg });
    }
  },
};
