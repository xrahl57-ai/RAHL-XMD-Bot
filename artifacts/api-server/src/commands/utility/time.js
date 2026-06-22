import moment from 'moment';
import { FOOTER } from '../../utils/helpers.js';

export default {
  name: 'time',
  aliases: ['date', 'clock'],
  description: 'Get current time and date',
  category: 'utility',
  cooldown: 3,

  async execute({ sock, msg, jid, fullArgs }) {
    let timezone = fullArgs || 'Africa/Nairobi';
    let timeStr;

    try {
      const now = new Date().toLocaleString('en-US', { timeZone: timezone, dateStyle: 'full', timeStyle: 'long' });
      timeStr = now;
    } catch (_) {
      timezone = 'UTC';
      timeStr = moment().utc().format('dddd, MMMM Do YYYY, HH:mm:ss [UTC]');
    }

    await sock.sendMessage(jid, {
      text: `🕐 *Current Time*\n\n📍 Timezone: ${timezone}\n📅 ${timeStr}\n\n${FOOTER}`,
    }, { quoted: msg });
  },
};
