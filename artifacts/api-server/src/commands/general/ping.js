export default {
  name: 'ping',
  aliases: ['speed', 'latency'],
  description: 'Check bot response latency',
  category: 'general',
  cooldown: 3,

  async execute({ sock, msg, jid }) {
    const start = Date.now();
    await sock.sendMessage(jid, { text: '🏓 _Pinging…_' }, { quoted: msg });
    const latency = Date.now() - start;

    const bar   = latency < 200 ? '🟢' : latency < 500 ? '🟡' : '🔴';
    const speed = latency < 200 ? 'Lightning Fast ⚡' : latency < 500 ? 'Good 👍' : 'Slow 🐢';

    await sock.sendMessage(jid, {
      text:
        `╔══════════════════════╗\n` +
        `║   🏓  *PING TEST*  🏓  ║\n` +
        `╚══════════════════════╝\n\n` +
        `${bar} *Response Time* ➜ \`${latency}ms\`\n` +
        `🚀 *Speed Rating* ➜ ${speed}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `⚡ _RAHL XMD_ 🦅`,
    }, { quoted: msg });
  },
};
