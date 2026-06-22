import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';
import { getBotInfo } from './whatsapp.js';
import { getConnectionStatus } from '../database/mongodb.js';
import { getAllCommands } from '../handlers/commandHandler.js';
import User from '../database/models/User.js';
import Group from '../database/models/Group.js';
import PremiumUser from '../database/models/PremiumUser.js';
import Statistics from '../database/models/Statistics.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, '../assets')));
app.set('view engine', 'ejs');
app.set('views', join(__dirname, '../views'));

app.use(session({
  secret: config.dashboardSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
}));

const DASHBOARD_PASS = process.env.DASHBOARD_PASSWORD || 'rahlxmd2024';

function requireAuth(req, res, next) {
  if (req.session?.authenticated) return next();
  res.redirect('/login');
}

app.get('/login', (req, res) => {
  if (req.session?.authenticated) return res.redirect('/');
  res.send(loginPage());
});

app.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === DASHBOARD_PASS) {
    req.session.authenticated = true;
    res.redirect('/');
  } else {
    res.send(loginPage('❌ Invalid password. Try again.'));
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/', requireAuth, async (req, res) => {
  const botInfo = getBotInfo();
  const dbStatus = getConnectionStatus();
  const commands = getAllCommands();

  let userCount = 0, groupCount = 0, premCount = 0;
  try {
    userCount = await User.countDocuments();
    groupCount = await Group.countDocuments();
    premCount = await PremiumUser.countDocuments({ active: true });
  } catch (_) {}

  const mem = process.memoryUsage();
  const uptimeMs = Date.now() - botInfo.startTime;
  const uptime = formatUptime(uptimeMs);

  res.send(dashboardPage({
    botName: config.botName,
    ownerName: config.ownerName,
    version: config.version,
    connected: botInfo.connected,
    number: botInfo.number,
    uptime,
    userCount,
    groupCount,
    premCount,
    commandCount: commands.size,
    dbConnected: dbStatus.connected,
    memMB: (mem.rss / 1024 / 1024).toFixed(1),
  }));
});

app.get('/api/status', requireAuth, async (req, res) => {
  const botInfo = getBotInfo();
  const dbStatus = getConnectionStatus();
  let userCount = 0, groupCount = 0, premCount = 0;
  try {
    userCount = await User.countDocuments();
    groupCount = await Group.countDocuments();
    premCount = await PremiumUser.countDocuments({ active: true });
  } catch (_) {}
  const mem = process.memoryUsage();

  res.json({
    bot: { name: config.botName, version: config.version, prefix: config.prefix },
    whatsapp: { connected: botInfo.connected, uptime: Date.now() - botInfo.startTime },
    database: dbStatus,
    stats: { users: userCount, groups: groupCount, premium: premCount },
    system: { memMB: (mem.rss / 1024 / 1024).toFixed(1), platform: process.platform, node: process.version },
  });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', bot: config.botName }));

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`;
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m ${s % 60}s`;
}

function loginPage(error = '') {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>RAHL XMD — Login</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0a0a0f;color:#fff;font-family:'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}
  .card{background:linear-gradient(135deg,#1a0a2e,#16213e);border:1px solid #7B2FBE40;border-radius:16px;padding:48px 40px;width:100%;max-width:420px;box-shadow:0 0 40px #7B2FBE30}
  .logo{text-align:center;margin-bottom:32px}
  .logo h1{font-size:2rem;background:linear-gradient(90deg,#7B2FBE,#FFD700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:2px}
  .logo p{color:#aaa;margin-top:4px;font-size:.9rem}
  .form-group{margin-bottom:20px}
  label{display:block;color:#ccc;margin-bottom:8px;font-size:.9rem}
  input{width:100%;padding:12px 16px;background:#ffffff10;border:1px solid #7B2FBE50;border-radius:8px;color:#fff;font-size:1rem;outline:none;transition:border .2s}
  input:focus{border-color:#7B2FBE}
  button{width:100%;padding:14px;background:linear-gradient(135deg,#7B2FBE,#9d3feb);color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;letter-spacing:1px;transition:opacity .2s}
  button:hover{opacity:.9}
  .error{background:#ff000020;border:1px solid #ff0000;border-radius:8px;padding:10px 14px;color:#ff6b6b;margin-bottom:16px;font-size:.9rem}
  .footer{text-align:center;color:#666;font-size:.8rem;margin-top:24px}
</style></head>
<body><div class="card">
  <div class="logo"><h1>👑 RAHL XMD</h1><p>Dashboard Login</p></div>
  ${error ? `<div class="error">${error}</div>` : ''}
  <form method="POST" action="/login">
    <div class="form-group"><label>Password</label><input type="password" name="password" placeholder="Enter dashboard password" required autofocus></div>
    <button type="submit">🔐 Login</button>
  </form>
  <div class="footer">👑 Powered By LORD RAHL</div>
</div></body></html>`;
}

function dashboardPage(data) {
  const statusDot = (ok) => ok
    ? '<span style="color:#00ff88">⬤ Online</span>'
    : '<span style="color:#ff4444">⬤ Offline</span>';

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>RAHL XMD Dashboard</title>
<meta http-equiv="refresh" content="30">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0a0a0f;color:#fff;font-family:'Segoe UI',sans-serif;min-height:100vh}
  nav{background:linear-gradient(135deg,#1a0a2e,#16213e);border-bottom:1px solid #7B2FBE40;padding:16px 32px;display:flex;align-items:center;justify-content:space-between}
  .brand{font-size:1.4rem;font-weight:700;background:linear-gradient(90deg,#7B2FBE,#FFD700);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .nav-links a{color:#ccc;text-decoration:none;margin-left:24px;font-size:.9rem;transition:color .2s}
  .nav-links a:hover{color:#FFD700}
  .container{max-width:1200px;margin:0 auto;padding:32px 24px}
  h2{font-size:1.5rem;margin-bottom:24px;color:#FFD700}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;margin-bottom:32px}
  .card{background:linear-gradient(135deg,#1a0a2e,#16213e);border:1px solid #7B2FBE30;border-radius:12px;padding:24px;transition:border-color .2s}
  .card:hover{border-color:#7B2FBE}
  .card .value{font-size:2rem;font-weight:700;color:#FFD700;margin:8px 0}
  .card .label{color:#aaa;font-size:.85rem}
  .card .icon{font-size:1.5rem;margin-bottom:8px}
  .info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
  .info-card{background:linear-gradient(135deg,#1a0a2e,#16213e);border:1px solid #7B2FBE30;border-radius:12px;padding:24px}
  .info-card h3{color:#7B2FBE;margin-bottom:16px;font-size:1rem;text-transform:uppercase;letter-spacing:1px}
  .info-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ffffff10;font-size:.9rem}
  .info-row:last-child{border-bottom:none}
  .info-row .key{color:#aaa}
  .info-row .val{color:#fff;font-weight:500}
  .footer-bar{text-align:center;color:#666;font-size:.8rem;padding:24px}
</style></head>
<body>
<nav>
  <div class="brand">👑 RAHL XMD</div>
  <div class="nav-links">
    <a href="/">Dashboard</a>
    <a href="/api/status">API</a>
    <a href="/logout">Logout</a>
  </div>
</nav>
<div class="container">
  <h2>📊 Bot Dashboard</h2>
  <div class="grid">
    <div class="card"><div class="icon">🤖</div><div class="value">${statusDot(data.connected)}</div><div class="label">WhatsApp Status</div></div>
    <div class="card"><div class="icon">👥</div><div class="value">${data.userCount}</div><div class="label">Total Users</div></div>
    <div class="card"><div class="icon">👥</div><div class="value">${data.groupCount}</div><div class="label">Total Groups</div></div>
    <div class="card"><div class="icon">💎</div><div class="value">${data.premCount}</div><div class="label">Premium Users</div></div>
    <div class="card"><div class="icon">⚡</div><div class="value">${data.commandCount}</div><div class="label">Commands Loaded</div></div>
    <div class="card"><div class="icon">🕐</div><div class="value" style="font-size:1.2rem">${data.uptime}</div><div class="label">Uptime</div></div>
    <div class="card"><div class="icon">💾</div><div class="value">${statusDot(data.dbConnected)}</div><div class="label">Database</div></div>
    <div class="card"><div class="icon">🧠</div><div class="value" style="font-size:1.2rem">${data.memMB} MB</div><div class="label">Memory Usage</div></div>
  </div>

  <div class="info-grid">
    <div class="info-card">
      <h3>🤖 Bot Information</h3>
      <div class="info-row"><span class="key">Name</span><span class="val">${data.botName}</span></div>
      <div class="info-row"><span class="key">Owner</span><span class="val">${data.ownerName}</span></div>
      <div class="info-row"><span class="key">Version</span><span class="val">v${data.version}</span></div>
      <div class="info-row"><span class="key">Number</span><span class="val">${data.number || 'Connecting...'}</span></div>
    </div>
    <div class="info-card">
      <h3>⚙️ System Information</h3>
      <div class="info-row"><span class="key">Platform</span><span class="val">${process.platform}</span></div>
      <div class="info-row"><span class="key">Node.js</span><span class="val">${process.version}</span></div>
      <div class="info-row"><span class="key">PID</span><span class="val">${process.pid}</span></div>
      <div class="info-row"><span class="key">Auto Refresh</span><span class="val">Every 30s</span></div>
    </div>
  </div>
</div>
<div class="footer-bar">👑 Powered By LORD RAHL &nbsp;|&nbsp; RAHL XMD v${data.version}</div>
</body></html>`;
}

export async function startDashboard() {
  const port = parseInt(process.env.PORT || '3000', 10);
  return new Promise((resolve, reject) => {
    app.listen(port, '0.0.0.0', () => {
      logger.info(`Dashboard running on port ${port}`);
      resolve();
    }).on('error', reject);
  });
}
