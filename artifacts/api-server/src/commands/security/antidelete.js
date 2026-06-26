/**
 * .antidelete on | off
 * Enables or disables anti-delete message recovery for the current chat.
 */

import { setAntiDelete, getAntiDelete } from '../../lib/chatSettings.js';

export default {
  name: 'antidelete',
  aliases: ['antidel', 'ad'],
  description: 'Enable or disable anti-delete message recovery',
  category: 'security',
  usage: '.antidelete on | off',
  cooldown: 5,

  async execute({ sock, msg, jid, args, isOwner, isAdmin }) {
    if (!isOwner && !isAdmin) {
      return sock.sendMessage(jid, {
        text: '🚫 *Anti-Delete* can only be configured by the *Owner* or *Group Admins*.',
      }, { quoted: msg });
    }

    const action = args[0]?.toLowerCase();

    if (!action || !['on', 'off', 'status'].includes(action)) {
      const current = await getAntiDelete(jid);
      return sock.sendMessage(jid, {
        text: `╔══════════════════╗\n     🦅 *RAHL XMD*\n╚══════════════════╝\n\n🛡️ *ANTI-DELETE SYSTEM*\n\n📊 *Current Status:* ${current ? 'ACTIVE 🟢' : 'INACTIVE 🔴'}\n\n📌 *Usage:*\n• _.antidelete on_ — Enable protection\n• _.antidelete off_ — Disable protection\n\n⚡ _RAHL SECURITY SYSTEM_`,
      }, { quoted: msg });
    }

    if (action === 'status') {
      const current = await getAntiDelete(jid);
      return sock.sendMessage(jid, {
        text: `🛡️ *Anti-Delete Status:* ${current ? 'ACTIVE 🟢' : 'INACTIVE 🔴'}`,
      }, { quoted: msg });
    }

    const enable = action === 'on';
    await setAntiDelete(jid, enable);

    await sock.sendMessage(jid, {
      text: `╔══════════════════╗\n     🦅 *RAHL XMD*\n╚══════════════════╝\n\n🛡️ *ANTI-DELETE SYSTEM*\n\n${enable
        ? '✅ *Protection ENABLED*\n\nDeleted messages will now be automatically recovered and resent.\n\n🟢 *Status:* ACTIVE'
        : '🔴 *Protection DISABLED*\n\nDeleted message recovery is now off for this chat.'
      }\n\n⚡ _RAHL SECURITY SYSTEM_`,
    }, { quoted: msg });
  },
};
