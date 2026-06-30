import axios from 'axios';

const weatherEmoji = (desc = '') => {
  const d = desc.toLowerCase();
  if (d.includes('sun') || d.includes('clear'))   return '☀️';
  if (d.includes('cloud') || d.includes('overcast')) return '☁️';
  if (d.includes('rain') || d.includes('drizzle')) return '🌧️';
  if (d.includes('thunder') || d.includes('storm')) return '⛈️';
  if (d.includes('snow') || d.includes('blizzard')) return '❄️';
  if (d.includes('fog') || d.includes('mist'))    return '🌫️';
  if (d.includes('wind'))                         return '💨';
  return '🌤️';
};

export default {
  name: 'weather',
  aliases: ['wthr', 'forecast'],
  description: 'Get weather for a location',
  category: 'utility',
  cooldown: 10,

  async execute({ sock, msg, jid, fullArgs }) {
    if (!fullArgs) {
      return sock.sendMessage(jid, {
        text:
          `❌ *Usage:* .weather <city>\n` +
          `📍 *Example:* .weather Nairobi`,
      }, { quoted: msg });
    }

    try {
      const res     = await axios.get(`https://wttr.in/${encodeURIComponent(fullArgs)}?format=j1`, { timeout: 10000 });
      const data    = res.data;
      const cur     = data.current_condition[0];
      const area    = data.nearest_area[0];
      const city    = area.areaName[0].value;
      const country = area.country[0].value;
      const desc    = cur.weatherDesc[0].value;
      const icon    = weatherEmoji(desc);
      const temp    = cur.temp_C;
      const feels   = cur.FeelsLikeC;
      const humidity = cur.humidity;
      const wind    = cur.windspeedKmph;
      const vis     = cur.visibility;
      const uv      = cur.uvIndex;

      await sock.sendMessage(jid, {
        text:
          `👑══════════════════════👑\n` +
          `  ${icon}  *WEATHER REPORT*  ${icon}\n` +
          `👑══════════════════════👑\n\n` +
          `📍 *Location* ➜ ${city}, ${country}\n` +
          `🌤️ *Condition* ➜ ${desc}\n\n` +
          `✦══════════════════════✦\n\n` +
          `🌡️ *Temperature* ➜ ${temp}°C\n` +
          `🤔 *Feels Like* ➜ ${feels}°C\n` +
          `💧 *Humidity* ➜ ${humidity}%\n` +
          `💨 *Wind Speed* ➜ ${wind} km/h\n` +
          `👁️ *Visibility* ➜ ${vis} km\n` +
          `☀️ *UV Index* ➜ ${uv}\n\n` +
          `✦══════════════════════✦\n` +
          `⚡ _RAHL XMD Weather_ 🌍`,
      }, { quoted: msg });
    } catch {
      await sock.sendMessage(jid, {
        text: `❌ *Could not fetch weather for:* _${fullArgs}_\n\n_Check the city name and try again._`,
      }, { quoted: msg });
    }
  },
};
