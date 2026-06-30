import axios from 'axios';

export default {
  name: 'lyrics',
  aliases: ['lyric', 'lyr'],
  description: 'Get song lyrics',
  category: 'utility',
  cooldown: 8,

  async execute({ sock, msg, jid, args, fullArgs }) {
    if (!fullArgs || args.length < 2) {
      return sock.sendMessage(jid, {
        text:
          `❌ Usage: .lyrics <artist> - <song>\n\n` +
          `Examples:\n` +
          `  .lyrics Ed Sheeran - Shape of You\n` +
          `  .lyrics Drake - God's Plan`,
      }, { quoted: msg });
    }

    // Parse "artist - song" format
    const parts = fullArgs.split(/\s*-\s*/);
    if (parts.length < 2) {
      return sock.sendMessage(jid, {
        text: `❌ Separate artist and song with a dash.\n\nExample: .lyrics Adele - Hello`,
      }, { quoted: msg });
    }

    const artist = parts[0].trim();
    const title  = parts.slice(1).join(' - ').trim();

    try {
      const res = await axios.get(
        `https://lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
        { timeout: 10_000 },
      );

      let lyricsText = res.data?.lyrics;
      if (!lyricsText) throw new Error('Lyrics not found for this song.');

      // WhatsApp message limit ~65k chars — trim if extremely long
      const MAX = 3000;
      let trimmed = false;
      if (lyricsText.length > MAX) {
        lyricsText = lyricsText.slice(0, MAX);
        trimmed = true;
      }

      const header = `🎵 *${title}*\n👤 *${artist}*\n${'─'.repeat(24)}\n\n`;
      const footer = trimmed
        ? '\n\n_[Lyrics trimmed — song is too long]_\n\n⚡ _RAHL XMD_'
        : '\n\n⚡ _RAHL XMD_';

      await sock.sendMessage(jid, {
        text: header + lyricsText + footer,
      }, { quoted: msg });
    } catch (err) {
      const msg2 = err.response?.status === 404
        ? `Lyrics not found for *${title}* by *${artist}*.\n_Check the spelling or try a different song._`
        : `Failed to fetch lyrics: ${err.message}`;

      await sock.sendMessage(jid, {
        text: `❌ ${msg2}`,
      }, { quoted: msg });
    }
  },
};
