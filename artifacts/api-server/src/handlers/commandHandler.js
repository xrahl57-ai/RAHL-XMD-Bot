import { readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMMANDS_DIR = join(__dirname, '../commands');

const commands = new Map();
const aliases = new Map();

export async function loadCommands() {
  commands.clear();
  aliases.clear();

  const categories = readdirSync(COMMANDS_DIR).filter((f) => {
    try {
      return statSync(join(COMMANDS_DIR, f)).isDirectory();
    } catch {
      return false;
    }
  });

  for (const category of categories) {
    const catDir = join(COMMANDS_DIR, category);
    const files = readdirSync(catDir).filter((f) => f.endsWith('.js'));

    for (const file of files) {
      try {
        const mod = await import(`${catDir}/${file}`);
        const cmd = mod.default || mod;

        if (!cmd || !cmd.name) continue;

        commands.set(cmd.name.toLowerCase(), { ...cmd, category });

        if (cmd.aliases && Array.isArray(cmd.aliases)) {
          for (const alias of cmd.aliases) {
            aliases.set(alias.toLowerCase(), cmd.name.toLowerCase());
          }
        }

        logger.info(`Loaded command: ${cmd.name} (${category})`);
      } catch (err) {
        logger.error(`Failed to load ${file}: ${err.message}`);
      }
    }
  }

  logger.info(`Total commands loaded: ${commands.size}`);
  return commands;
}

export function getCommand(name) {
  const lower = name.toLowerCase();
  if (commands.has(lower)) return commands.get(lower);
  if (aliases.has(lower)) return commands.get(aliases.get(lower));
  return null;
}

export function getAllCommands() {
  return commands;
}

export function getCommandsByCategory(category) {
  return [...commands.values()].filter((c) => c.category === category);
}

export function getCategories() {
  const cats = new Set([...commands.values()].map((c) => c.category));
  return [...cats];
}
