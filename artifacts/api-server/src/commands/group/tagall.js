import { getJidNumber, FOOTER } from '../../utils/helpers.js';

export default {
  name: 'tagall',
  aliases: ['mentionall', 'everyone'],
  description: 'Mention all group members',
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  cooldown: 15,

  async execute({ sock, msg, jid, fullArgs }) {
    const metadata = await sock.groupMetadata(jid);
    const participants = metadata.participants.map(p => p.id);
    const mentions = participants;
    const text = fullArgs || '📢 Attention everyone!';

    const mentionText = `${text}\n\n${participants.map(p => `@${getJidNumber(p)}`).join(' ')}\n\n${FOOTER}`;

    await sock.sendMessage(jid, { text: mentionText, mentions }, { quoted: msg });
  },
};
