import axios from 'axios';
import { FOOTER } from '../../utils/helpers.js';

export default {
  name: 'weather',
  aliases: ['wthr', 'forecast'],
  description: 'Get weather for a location',
  category: 'utility',
  cooldown: 10,

  async execute({ sock, msg, jid, fullArgs }) {
    if (!fullArgs) {
      return sock.sendMessage(jid, {
        text: `❌ Usage: .weather <city>\nExample: .weather Nairobi\n\n${FOOTER}`,
      }, { quoted: msg });
    }

    try {
      const geoRes = await axios.get(
        `https://wttr.in/${encodeURIComponent(fullArgs)}?format=j1`,
        { timeout: 8000 },
      );

      const data = geoRes.data;
      const current = data.current_condition[0];
      const area = data.nearest_area[0];
      const city = area.areaName[0].value;
      const country = area.country[0].value;
      const temp = current.temp_C;
      const feelsLike = current.FeelsLikeC;
      const humidity = current.humidity;
      const desc = current.weatherDesc[0].value;
      const wind = current.windspeedKmph;

      await sock.sendMessage(jid, {
        text: `🌤️ *Weather: ${city}, ${country}*\n\n🌡️ Temperature: ${temp}°C (Feels like ${feelsLike}°C)\n☁️ Condition: ${desc}\n💧 Humidity: ${humidity}%\n💨 Wind: ${wind} km/h\n\n${FOOTER}`,
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ Could not get weather. Try a different city name.\n\n${FOOTER}`,
      }, { quoted: msg });
    }
  },
};
