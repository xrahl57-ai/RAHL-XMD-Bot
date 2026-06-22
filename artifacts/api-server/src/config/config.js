export const config = {
  botName: process.env.BOT_NAME || 'RAHL XMD',
  prefix: process.env.PREFIX || '.',
  ownerName: process.env.OWNER_NAME || 'LORD RAHL',
  ownerNumber: process.env.OWNER_NUMBER || '254112399557',
  ownerJid: `${process.env.OWNER_NUMBER || '254112399557'}@s.whatsapp.net`,
  footer: process.env.FOOTER || '👑 Powered By LORD RAHL',
  version: '1.0.0',
  mongoUri: process.env.MONGODB_URI || '',
  port: parseInt(process.env.PORT || '3000', 10),
  sessionId: process.env.SESSION_ID || '',
  openaiKey: process.env.OPENAI_API_KEY || '',
  geminiKey: process.env.GEMINI_API_KEY || '',
  logLevel: process.env.LOG_LEVEL || 'info',
  dashboardSecret: process.env.DASHBOARD_SECRET || 'rahlxmd_secret_2024',
  theme: {
    purple: '#7B2FBE',
    gold: '#FFD700',
  },
  antiSpam: {
    maxCommandsPerMinute: 10,
    cooldownSeconds: 3,
    floodThreshold: 5,
  },
  reconnect: {
    maxRetries: 10,
    delayMs: 3000,
  },
};
