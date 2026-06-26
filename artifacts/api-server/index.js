import 'dotenv/config';
import chalk from 'chalk';
import figlet from 'figlet';
import { connectMongoDB } from './src/database/mongodb.js';
import { startWhatsApp } from './src/services/whatsapp.js';
import { startDashboard } from './src/services/dashboard.js';
import { logger } from './src/utils/logger.js';
import { runSessionDiagnostic } from './src/utils/sessionDiagnostic.js';

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

  if (!process.env.SESSION_ID) {
    logger.error('SESSION_ID is not set in environment variables.');
    console.error(chalk.red('✗ SESSION_ID missing. Set SESSION_ID in your environment.'));
    process.exit(1);
  }

  const diag = runSessionDiagnostic();

  if (!diag.pass) {
    logger.error(`Session diagnostic failed — reason: ${diag.reason}`);
    console.error(chalk.red('\n✗ SESSION DIAGNOSTIC FAILED'));
    console.error(chalk.red(`  Reason   : ${diag.reason}`));
    if (diag.error)          console.error(chalk.red(`  Error    : ${diag.error}`));
    if (diag.position >= 0)  console.error(chalk.red(`  Position : ${diag.position}`));
    if (diag.rawLength)      console.error(chalk.red(`  Raw len  : ${diag.rawLength}`));
    if (diag.cleanedLength)  console.error(chalk.red(`  Cleaned  : ${diag.cleanedLength}`));
    if (diag.bufferBytes)    console.error(chalk.red(`  Bytes    : ${diag.bufferBytes}`));
    if (diag.decodedLength)  console.error(chalk.red(`  Decoded  : ${diag.decodedLength}`));
    if (diag.balanced !== undefined) console.error(chalk.red(`  Balanced : ${diag.balanced}`));
    if (diag.quotesEven !== undefined) console.error(chalk.red(`  QuotesOK : ${diag.quotesEven}`));
    console.error(chalk.yellow('\n  → Check /tmp/session_debug.txt in Render shell for the raw decoded content.'));
    process.exit(1);
  }

  console.log(chalk.hex('#7B2FBE')('✓ Session Loaded'));
  logger.info('SESSION_ID validated and decoded successfully.');

  try {
    await connectMongoDB();
    console.log(chalk.hex('#7B2FBE')('✓ Database Connected'));
    logger.info('MongoDB connected.');
  } catch (err) {
    logger.warn('MongoDB connection failed (non-fatal):', err.message);
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
