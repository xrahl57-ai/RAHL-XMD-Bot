export default {
  name: 'ping',
  aliases: ['speed', 'latency'],
  description: 'Check bot response latency',
  category: 'general',
  cooldown: 3,

  async execute({ sock, msg, jid }) {
    const start = Date.now();
    const sent = await sock.sendMessage(jid, { text: '🏓 Pinging...' }, { quoted: msg });
    const latency = Date.now() - start;

    await sock.sendMessage(jid, {
      text: `🏓 *Pong!*\n\n⚡ *Response:* ${latency}ms\n\n👑 Powered By LORD RAHL`,
    }, { quoted: msg });
  },
};
