import Group from '../../database/models/Group.js';
import { FOOTER } from '../../utils/helpers.js';
import { sleep } from '../../utils/helpers.js';

export default {
  name: 'broadcast',
  aliases: ['bc', 'bcast'],
  description: 'Broadcast a message to all groups',
  category: 'owner',
  ownerOnly: true,
  cooldown: 60,

  async execute({ sock, msg, jid, fullArgs }) {
    if (!fullArgs) {
      return sock.sendMessage(jid, { text: `📢 Usage: .broadcast <message>\n\n${FOOTER}` }, { quoted: msg });
    }

    const groups = await Group.find({}).lean();
    if (!groups.length) {
      return sock.sendMessage(jid, { text: '❌ No groups found in database.' }, { quoted: msg });
    }

    await sock.sendMessage(jid, {
      text: `📢 Broadcasting to *${groups.length}* groups...\n\n${FOOTER}`,
    }, { quoted: msg });

    let sent = 0;
    let failed = 0;

    for (const group of groups) {
      try {
        await sock.sendMessage(group.jid, {
          text: `📢 *Broadcast from ${process.env.BOT_NAME || 'RAHL XMD'}:*\n\n${fullArgs}\n\n${FOOTER}`,
        });
        sent++;
        await sleep(500);
      } catch (_) {
        failed++;
      }
    }

    await sock.sendMessage(jid, {
      text: `✅ Broadcast complete!\n✓ Sent: ${sent}\n✗ Failed: ${failed}`,
    }, { quoted: msg });
  },
};
