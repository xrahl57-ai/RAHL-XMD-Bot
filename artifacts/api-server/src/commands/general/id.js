import { getJidNumber } from '../../utils/helpers.js';

export default {
  name: 'id',
  aliases: ['myid', 'number', 'jid', 'whoami'],
  description: 'Show your WhatsApp number and JID',
  category: 'general',
  cooldown: 5,

  async execute({ sock, msg, jid, sender, pushName, isGroup }) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const target    = mentioned || sender;
    const number    = getJidNumber(target);
    const isMe      = target === sender;

    // If replying to someone or mentioning, show their info
    const targetName = isMe
      ? pushName || 'You'
      : msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
          ? `@${number}`
          : pushName || number;

    let text =
      `📋 *User Info*\n\n` +
      `👤 *Name:* ${isMe ? pushName || 'Unknown' : targetName}\n` +
      `📱 *Number:* +${number}\n` +
      `🆔 *JID:* \`${target}\`\n`;

    if (isGroup) {
      text += `\n💬 *Chat:* Group\n🔑 *Group JID:* \`${jid}\``;
    } else {
      text += `\n💬 *Chat:* Private`;
    }

    text += `\n\n⚡ _RAHL XMD_`;

    await sock.sendMessage(jid, {
      text,
      mentions: mentioned ? [target] : [],
    }, { quoted: msg });
  },
};
