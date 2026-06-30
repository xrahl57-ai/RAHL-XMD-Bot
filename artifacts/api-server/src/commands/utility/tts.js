import axios from 'axios';

const VOICES = ['Brian', 'Amy', 'Emma', 'Joanna', 'Joey', 'Justin', 'Kendra', 'Kimberly', 'Matthew', 'Salli'];

export default {
  name: 'tts',
  aliases: ['speak', 'texttospeech', 'voice'],
  description: 'Convert text to speech',
  category: 'utility',
  cooldown: 10,

  async execute({ sock, msg, jid, args, fullArgs }) {
    if (!fullArgs) {
      return sock.sendMessage(jid, {
        text:
          `❌ Usage: .tts <text>\n\n` +
          `Example: .tts Hello! I am RAHL XMD\n\n` +
          `Available voices: ${VOICES.join(', ')}\n` +
          `Use: .tts Brian: Hello world`,
      }, { quoted: msg });
    }

    // Allow optional voice selection: ".tts Brian: your text here"
    let voice = 'Brian';
    let text  = fullArgs;

    const voiceMatch = fullArgs.match(/^([A-Za-z]+)\s*:\s*(.+)/);
    if (voiceMatch && VOICES.includes(voiceMatch[1])) {
      voice = voiceMatch[1];
      text  = voiceMatch[2];
    }

    if (text.length > 500) {
      return sock.sendMessage(jid, {
        text: `❌ Text too long. Maximum 500 characters (current: ${text.length}).`,
      }, { quoted: msg });
    }

    try {
      const url = `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodeURIComponent(text)}`;
      const res = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 15_000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });

      const buffer = Buffer.from(res.data);

      await sock.sendMessage(jid, {
        audio: buffer,
        mimetype: 'audio/mpeg',
        pttAudio: false,
      }, { quoted: msg });

      await sock.sendMessage(jid, {
        text:
          `👑══════════════════════👑\n` +
          `   🔊  *TEXT TO SPEECH*\n` +
          `👑══════════════════════👑\n\n` +
          `✅ *Audio Generated!*\n\n` +
          `🎙️ *Voice* ➜ ${voice}\n` +
          `📝 *Text* ➜ _${text}_\n\n` +
          `✦══════════════════════✦\n` +
          `⚡ _RAHL XMD TTS_ 🦅`,
      });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ *TTS Failed*\n\n_${err.message}_`,
      }, { quoted: msg });
    }
  },
};
