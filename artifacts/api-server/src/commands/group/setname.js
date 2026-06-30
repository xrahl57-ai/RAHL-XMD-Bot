export default {
  name: 'setname',
  aliases: ['rename', 'groupname'],
  description: 'Change the group name',
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  cooldown: 10,

  async execute({ sock, msg, jid, fullArgs, isBotAdmin }) {
    if (!isBotAdmin) {
      return sock.sendMessage(jid, {
        text: `❌ I need to be an admin to change the group name.`,
      }, { quoted: msg });
    }

    if (!fullArgs) {
      return sock.sendMessage(jid, {
        text: `❌ Usage: .setname <new group name>`,
      }, { quoted: msg });
    }

    if (fullArgs.length > 25) {
      return sock.sendMessage(jid, {
        text: `❌ Group name is too long. Maximum is 25 characters (current: ${fullArgs.length}).`,
      }, { quoted: msg });
    }

    try {
      await sock.groupUpdateSubject(jid, fullArgs);
      await sock.sendMessage(jid, {
        text: `✅ *Group name updated!*\n\n📝 *New name:* ${fullArgs}\n\n⚡ _RAHL XMD_`,
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ Failed to update group name: ${err.message}`,
      }, { quoted: msg });
    }
  },
};
