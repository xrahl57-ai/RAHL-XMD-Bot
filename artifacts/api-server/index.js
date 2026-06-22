import 'dotenv/config';
import chalk from 'chalk';
import figlet from 'figlet';
import { connectMongoDB } from './src/database/mongodb.js';
import { startWhatsApp } from './src/services/whatsapp.js';
import { startDashboard } from './src/services/dashboard.js';
import { logger } from './src/utils/logger.js';
import { validateSession } from './src/utils/sessionLoader.js';
import { loadCommands } from './src/handlers/commandHandler.js';

function printBanner() {
  try {
    const banner = figlet.textSync('RAHL XMD', { font: 'Big' });
    console.log(chalk.hex('#7B2FBE')(banner));
  } catch (_) {
    console.log(chalk.hex('#7B2FBE').bold('  ██████╗  █████╗ ██╗  ██╗██╗     ██╗  ██╗███╗   ███╗██████╗'));
    console.log(chalk.hex('#7B2FBE').bold('  RAHL XMD'));
  }

  console.log(chalk.hex('#FFD700')('👑━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━👑'));
  console.log(chalk.hex('#7B2FBE').bold('  Bot Name : ') + chalk.white('RAHL XMD'));
  console.log(chalk.hex('#7B2FBE').bold('  Owner    : ') + chalk.white('LORD RAHL'));
  console.log(chalk.hex('#7B2FBE').bold('  Prefix   : ') + chalk.white(process.env.PREFIX || '.'));
  console.log(chalk.hex('#7B2FBE').bold('  Version  : ') + chalk.white('1.0.0'));
  console.log(chalk.hex('#FFD700')('👑━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━👑\n'));
}

async function main() {
  printBanner();
  logger.info('Starting RAHL XMD Bot...');

  const sessionId = process.env.SESSION_ID;
  if (sessionId) {
    const sessionValid = validateSession(sessionId);
    if (sessionValid) {
      console.log(chalk.hex('#7B2FBE')('✓ Session Loaded'));
      logger.info('Session validated successfully.');
    } else {
      logger.warn('SESSION_ID present but appears invalid or malformed.');
      console.log(chalk.yellow('⚠ Session format may be invalid — will attempt connection anyway.'));
    }
  } else {
    console.log(chalk.yellow('⚠ No SESSION_ID set — WhatsApp connection disabled.'));
  }

  try {
    await connectMongoDB();
    console.log(chalk.hex('#7B2FBE')('✓ Database Connected'));
  } catch (err) {
    logger.warn('MongoDB connection failed:', err.message);
    console.log(chalk.yellow('⚠ Database not connected — Some features may be unavailable.'));
  }

  if (sessionId) {
    try {
      await startWhatsApp();
    } catch (err) {
      logger.error('WhatsApp service failed:', err.message);
      console.log(chalk.yellow('⚠ WhatsApp connection failed — Dashboard-only mode.'));
    }
  } else {
    const commands = await loadCommands();
    console.log(chalk.hex('#7B2FBE')(`✓ Commands Loaded (${commands.size} commands)`));
  }

  try {
    await startDashboard();
    const port = process.env.PORT || 3000;
    console.log(chalk.hex('#7B2FBE')(`✓ Dashboard Started → http://localhost:${port}`));
  } catch (err) {
    logger.error('Dashboard failed to start:', err.message);
    console.log(chalk.red('✗ Dashboard failed to start:', err.message));
    process.exit(1);
  }

  console.log('');
  console.log(chalk.hex('#FFD700')('👑━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━👑'));
  console.log(chalk.green.bold('  RAHL XMD is Online and Ready!'));
  console.log(chalk.hex('#FFD700')('👑━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━👑'));
}

main().catch((err) => {
  logger.error('Fatal error during startup:', err);
  console.error(chalk.red('Fatal startup error:'), err.message);
  process.exit(1);
});
