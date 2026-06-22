import { FOOTER } from '../../utils/helpers.js';

export default {
  name: 'hidetag',
  aliases: ['htag', 'silent'],
  description: 'Tag all members silently',
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  cooldown: 15,

  async execute({ sock, msg, jid, fullArgs }) {
    const metadata = await sock.groupMetadata(jid);
    const participants = metadata.participants.map(p => p.id);
    const text = fullArgs || '📢 Group Announcement';

    await sock.sendMessage(jid, {
      text: `${text}\n\n${FOOTER}`,
      mentions: participants,
    }, { quoted: msg });
  },
};
