import 'dotenv/config';
import chalk from 'chalk';
import figlet from 'figlet';
import cron from 'node-cron';
import axios from 'axios';
import { connectMongoDB } from './src/database/mongodb.js';
import { startWhatsApp } from './src/services/whatsapp.js';
import { startDashboard } from './src/services/dashboard.js';
import { logger } from './src/utils/logger.js';

function printBanner() {
  try {
    const banner = figlet.textSync('RAHL XMD', { font: 'Big' });
    console.log(chalk.hex('#7B2FBE')(banner));
  } catch (_) {}

  console.log(chalk.hex('#FFD700')('👑━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━👑'));
  console.log(chalk.hex('#7B2FBE').bold('  Bot Name : ') + chalk.white('RAHL XMD'));
  console.log(chalk.hex('#7B2FBE').bold('  Owner    : ') + chalk.white('LORD RAHL'));
  console.log(chalk.hex('#7B2FBE').bold('  Prefix   : ') + chalk.white(process.env.PREFIX || '.'));
  console.log(chalk.hex('#7B2FBE').bold('  Version  : ') + chalk.white('1.0.0'));
  console.log(chalk.hex('#FFD700')('👑━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━👑\n'));
}

async function main() {
  printBanner();

  console.log(chalk.hex('#7B2FBE')('✓ Environment Loaded'));
  logger.info('RAHL XMD starting up...');

  const mongoConnected = await connectMongoDB().catch((err) => {
    logger.warn('MongoDB connection failed (non-fatal):', err.message);
    return false;
  });

  if (mongoConnected) {
    console.log(chalk.hex('#7B2FBE')('✓ Database Connected'));
    logger.info('MongoDB connected.');
  } else {
    console.log(chalk.yellow('⚠ Database not connected — DB-backed features will be unavailable.'));
  }

  try {
    await startWhatsApp();
  } catch (err) {
    logger.error('WhatsApp startup failed:', err);
    console.error(chalk.red('✗ WhatsApp connection error:'), err.message || err);
    process.exit(1);
  }

  try {
    await startDashboard();
    const port = process.env.PORT || 3000;
    console.log(chalk.hex('#7B2FBE')(`✓ Dashboard Started → http://localhost:${port}`));
    logger.info(`Dashboard started on port ${port}.`);
  } catch (err) {
    logger.error('Dashboard failed to start:', err);
    console.error(chalk.red('✗ Dashboard error:'), err.message || err);
    process.exit(1);
  }

  // Keep-alive: ping own health endpoint every 14 minutes so Render never sleeps
  const selfUrl = process.env.RENDER_EXTERNAL_URL
    ? `${process.env.RENDER_EXTERNAL_URL}/healthz`
    : `http://localhost:${process.env.PORT || 3000}/healthz`;

  cron.schedule('*/14 * * * *', async () => {
    try {
      await axios.get(selfUrl, { timeout: 10000 });
      logger.info('[keep-alive] Pinged self — bot stays awake');
    } catch (e) {
      logger.warn('[keep-alive] Ping failed:', e.message);
    }
  });

  console.log('');
  console.log(chalk.hex('#FFD700')('👑━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━👑'));
  console.log(chalk.green.bold('  RAHL XMD is Online and Ready!'));
  console.log(chalk.hex('#FFD700')('👑━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━👑'));
}

main().catch((err) => {
  logger.error('Fatal startup error:', err);
  console.error(chalk.red('✗ Fatal error:'), err.message || err);
  process.exit(1);
});
