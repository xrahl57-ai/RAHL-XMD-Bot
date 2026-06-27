import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getAllCommands } from '../../handlers/commandHandler.js';
import { formatUptime, BOT_NAME, OWNER_NAME, PREFIX, FOOTER } from '../../utils/helpers.js';
import { getBotInfo } from '../../services/whatsapp.js';
import User from '../../database/models/User.js';
import Group from '../../database/models/Group.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BANNER = join(__dirname, '../../assets/banner.jpg');

function getBanner() {
  try { return readFileSync(BANNER); } catch (_) { return null; }
}

export default {
  name: 'menu',
  aliases: ['help', 'm'],
  description: 'Display the premium RAHL XMD menu',
  category: 'general',
  cooldown: 5,

  async execute({ sock, msg, jid, pushName }) {
    const botInfo = getBotInfo();
    const uptime = formatUptime(botInfo.startTime);
    const banner = getBanner();

    let userCount = 0;
    let groupCount = 0;
    try {
      userCount = await User.countDocuments();
      groupCount = await Group.countDocuments();
    } catch (_) {}

    const allCmds = getAllCommands();
    const generalCmds  = [...allCmds.values()].filter(c => c.category === 'general').map(c => c.name);
    const ownerCmds    = [...allCmds.values()].filter(c => c.category === 'owner').map(c => c.name);
    const groupCmds    = [...allCmds.values()].filter(c => c.category === 'group').map(c => c.name);
    const utilityCmds  = [...allCmds.values()].filter(c => c.category === 'utility').map(c => c.name);
    const aiCmds       = [...allCmds.values()].filter(c => c.category === 'ai').map(c => c.name);
    const premiumCmds  = [...allCmds.values()].filter(c => c.category === 'premium').map(c => c.name);
    const downloaderCmds = [...allCmds.values()].filter(c => c.category === 'downloader').map(c => c.name);

    const menuText = `╔══════════════════════╗
║    👑 *RAHL XMD* 👑    ║
╚══════════════════════╝

👤 *User:* ${pushName}
⚡ *Runtime:* ${uptime}
📈 *Users:* ${userCount}
👥 *Groups:* ${groupCount}

════════════════════════

👑 *Owner Menu* [${ownerCmds.length}]
${ownerCmds.map(c => `  ▸ ${PREFIX}${c}`).join('\n')}

🛡️ *General Menu* [${generalCmds.length}]
${generalCmds.map(c => `  ▸ ${PREFIX}${c}`).join('\n')}

👥 *Group Menu* [${groupCmds.length}]
${groupCmds.map(c => `  ▸ ${PREFIX}${c}`).join('\n')}

🎨 *Utility Menu* [${utilityCmds.length}]
${utilityCmds.map(c => `  ▸ ${PREFIX}${c}`).join('\n')}

🤖 *AI Menu* [${aiCmds.length}]
${aiCmds.map(c => `  ▸ ${PREFIX}${c}`).join('\n')}

💎 *Premium Menu* [${premiumCmds.length}]
${premiumCmds.map(c => `  ▸ ${PREFIX}${c}`).join('\n')}

⬇️ *Downloader Menu* [${downloaderCmds.length}]
${downloaderCmds.map(c => `  ▸ ${PREFIX}${c}`).join('\n')}

════════════════════════
${FOOTER}`;

    // Send banner image above menu
    if (banner) {
      await sock.sendMessage(jid, {
        image: banner,
        caption: menuText,
      }, { quoted: msg });

      // Send banner image again below menu
      await sock.sendMessage(jid, {
        image: banner,
        caption: '👑 *RAHL XMD* — _Powered By LORD RAHL_ 🦅',
      });
    } else {
      await sock.sendMessage(jid, { text: menuText }, { quoted: msg });
    }
  },
};
