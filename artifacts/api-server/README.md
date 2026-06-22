# 👑 RAHL XMD — WhatsApp Multi-Device Bot

A premium, production-ready WhatsApp bot built with Node.js, Baileys, MongoDB, and Express.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `SESSION_ID` — Your Base64 Baileys session
- `MONGODB_URI` — Your MongoDB connection string (optional)
- `GEMINI_API_KEY` or `OPENAI_API_KEY` — For AI commands (optional)

### 3. Start the bot
```bash
npm start
```

---

## 🔐 Session Setup

RAHL XMD uses a Base64-encoded Baileys session stored in `.env`.

Generate your session using a Baileys pairing tool, encode the credentials JSON as Base64, and set it as `SESSION_ID` in your `.env` file.

```
SESSION_ID=eyJjcmVkcyI6eyJub2lzZUtleSI6...
```

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SESSION_ID` | ✅ | Base64 Baileys session |
| `MONGODB_URI` | ⚠️ | MongoDB URI (disables DB features if missing) |
| `BOT_NAME` | No | Bot display name (default: RAHL XMD) |
| `PREFIX` | No | Command prefix (default: .) |
| `OWNER_NAME` | No | Owner name |
| `OWNER_NUMBER` | No | Owner WhatsApp number |
| `PORT` | No | Dashboard port (default: 3000) |
| `OPENAI_API_KEY` | No | OpenAI key for AI commands |
| `GEMINI_API_KEY` | No | Gemini key for AI commands |
| `DASHBOARD_PASSWORD` | No | Dashboard login password |

---

## 📁 Project Structure

```
rahl-xmd/
├── index.js                    # Bot entry point
├── src/
│   ├── config/config.js        # Configuration
│   ├── commands/               # All commands
│   │   ├── general/            # Menu, alive, ping, etc.
│   │   ├── owner/              # Restart, broadcast, eval, etc.
│   │   ├── group/              # Admin tools
│   │   ├── utility/            # Sticker, QR, translate, etc.
│   │   ├── ai/                 # AI commands (Gemini/OpenAI)
│   │   └── premium/            # Premium user commands
│   ├── database/               # MongoDB models
│   ├── events/                 # Connection, message, group events
│   ├── handlers/               # Command & message routing
│   ├── services/               # WhatsApp + Dashboard
│   ├── utils/                  # Logger, anti-spam, helpers
│   └── assets/                 # owner.jpg, etc.
├── logs/                       # Rotated log files
├── .session/                   # Baileys session (auto-created)
├── .env.example                # Environment template
├── Dockerfile                  # Container setup
├── ecosystem.config.js         # PM2 configuration
├── railway.json                # Railway deployment
└── render.yaml                 # Render deployment
```

---

## 🤖 Commands

### General
| Command | Description |
|---------|-------------|
| `.menu` | Display premium menu |
| `.alive` | Bot status check |
| `.ping` | Response latency |
| `.owner` | Owner details |
| `.runtime` | Bot uptime |
| `.info` | Bot information |

### Owner Only
| Command | Description |
|---------|-------------|
| `.restart` | Restart the bot |
| `.shutdown` | Shutdown the bot |
| `.broadcast` | Message all groups |
| `.block` / `.unblock` | Block users |
| `.addprem` / `.delprem` | Manage premium |
| `.eval` | Run JavaScript |
| `.exec` | Run shell commands |

### Group (Admin Only)
| Command | Description |
|---------|-------------|
| `.tagall` | Mention everyone |
| `.kick` | Remove member |
| `.promote` / `.demote` | Manage admins |
| `.mute` / `.unmute` | Lock/unlock group |
| `.warn` / `.resetwarn` | Warning system |
| `.welcome` | Welcome messages |
| `.antilink` / `.antibot` / `.antispam` | Protection |
| `.groupinfo` | Group details |

### Utility
| Command | Description |
|---------|-------------|
| `.sticker` | Image to sticker |
| `.toimg` | Sticker to image |
| `.qr` | Generate QR code |
| `.translate` | Translate text |
| `.weather` | Weather lookup |
| `.time` | Current time |
| `.fetch` | Fetch from URL |
| `.shorturl` | Shorten URL |

### AI
| Command | Description |
|---------|-------------|
| `.ai` / `.ask` | Chat with AI |
| `.code` | Generate code |
| `.explain` | Explain a concept |
| `.imagine` | Generate image (OpenAI) |

---

## 🌐 Dashboard

Access the web dashboard at: `http://your-server:3000`

Default password: `rahlxmd2024` (change via `DASHBOARD_PASSWORD` in `.env`)

Features:
- Live bot status
- WhatsApp connection status
- User/group/premium counts
- System metrics
- Auto-refresh every 30s

---

## 🚢 Deployment

### Railway
```bash
railway up
```

### Render
Connect your GitHub repo and use `render.yaml`.

### PM2 (VPS)
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Docker
```bash
docker build -t rahl-xmd .
docker run -d --env-file .env -p 3000:3000 rahl-xmd
```

---

## 📋 Adding Owner Image

Place your owner photo at:
```
src/assets/owner.jpg
```

The `.owner` command will automatically send this image.

---

## 👑 Powered By LORD RAHL
