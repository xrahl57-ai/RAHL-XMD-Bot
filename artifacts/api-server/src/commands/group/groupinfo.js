import Group from '../../database/models/Group.js';
import { formatDate, FOOTER } from '../../utils/helpers.js';

export default {
  name: 'groupinfo',
  aliases: ['ginfo', 'gcinfo'],
  description: 'Show group information',
  category: 'group',
  groupOnly: true,
  cooldown: 10,

  async execute({ sock, msg, jid }) {
    const metadata = await sock.groupMetadata(jid);
    const dbGroup = await Group.findOne({ jid }).lean();

    const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
    const created = metadata.creation ? new Date(metadata.creation * 1000) : null;

    const text = `╔══════════════════════╗
║   👥 *Group Info*    ║
╚══════════════════════╝

📛 *Name:* ${metadata.subject}
🆔 *JID:* ${jid}
📝 *Desc:* ${metadata.desc?.slice(0, 100) || 'No description'}
👥 *Members:* ${metadata.participants.length}
👑 *Admins:* ${admins.length}
🗓️ *Created:* ${created ? formatDate(created) : 'Unknown'}
🔗 *Join Link:* ${metadata.inviteCode ? `https://chat.whatsapp.com/${metadata.inviteCode}` : 'Disabled'}

⚙️ *Bot Settings*
🔗 Anti-Link: ${dbGroup?.antilink ? '✅' : '❌'}
🤖 Anti-Bot: ${dbGroup?.antibot ? '✅' : '❌'}
🛡️ Anti-Spam: ${dbGroup?.antispam ? '✅' : '❌'}
👋 Welcome: ${dbGroup?.welcome ? '✅' : '❌'}

${FOOTER}`;

    await sock.sendMessage(jid, { text }, { quoted: msg });
  },
};
