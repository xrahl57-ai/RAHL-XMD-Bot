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
        // Revoke old link and generate a new one
        await sock.groupRevokeInvite(jid);
        const newCode = await sock.groupInviteCode(jid);
        await sock.sendMessage(jid, {
          text:
            `🔄 *Group invite link reset!*\n\n` +
            `🔗 *New link:* https://chat.whatsapp.com/${newCode}\n\n` +
            `_Old link is now invalid._\n\n` +
            `⚡ _RAHL XMD_`,
        }, { quoted: msg });
      } else {
        // Just fetch the current link
        const code = await sock.groupInviteCode(jid);
        await sock.sendMessage(jid, {
          text:
            `🔗 *Group Invite Link*\n\n` +
            `https://chat.whatsapp.com/${code}\n\n` +
            `_Share this link to invite people.\nTo reset it: .grouplink reset_\n\n` +
            `⚡ _RAHL XMD_`,
        }, { quoted: msg });
      }
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ Failed to get invite link: ${err.message}`,
      }, { quoted: msg });
    }
  },
};
