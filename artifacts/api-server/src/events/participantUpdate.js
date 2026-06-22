import Group from '../database/models/Group.js';
import { config } from '../config/config.js';
import { getJidNumber } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';

export async function handleParticipantUpdate(sock, update) {
  const { id: jid, participants, action } = update;
  if (!jid || !participants) return;

  try {
    const groupData = await Group.findOne({ jid }).lean();

    if (action === 'add' && groupData?.welcome) {
      const metadata = await sock.groupMetadata(jid).catch(() => null);
      const groupName = metadata?.subject || 'this group';

      for (const participant of participants) {
        const number = getJidNumber(participant);
        const welcomeText =
          groupData.welcomeMessage ||
          `╔════════════════════╗\n👑 *RAHL XMD* 👑\n╚════════════════════╝\n\n✨ Welcome @${number}!\n\n💜 *Group:* ${groupName}\n\n📖 Please read the group rules.\n\n⚡ Enjoy your stay!\n\n${config.footer}`;

        try {
          const ppUrl = await sock.profilePictureUrl(participant, 'image').catch(() => null);

          if (ppUrl) {
            const response = await fetch(ppUrl);
            const buffer = Buffer.from(await response.arrayBuffer());
            await sock.sendMessage(jid, {
              image: buffer,
              caption: welcomeText,
              mentions: [participant],
            });
          } else {
            await sock.sendMessage(jid, {
              text: welcomeText,
              mentions: [participant],
            });
          }
        } catch (e) {
          logger.error('Welcome message error:', e.message);
        }
      }
    } else if (action === 'remove') {
      logger.info(`Participants removed from ${jid}: ${participants.join(', ')}`);
    }
  } catch (err) {
    logger.error('Participant update error:', err.message);
  }
}
