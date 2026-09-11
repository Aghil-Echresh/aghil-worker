# ⚡ Aghil Worker

Autonomous AI Worker Dashboard

Version: 1.0.0

---

## Features

- AI Worker Dashboard
- Worker configuration
- Mission configuration
- Personality configuration
- Local memory
- Chat interface
- Tool management
- WhatsApp integration placeholder
- Backend API
- Cloudflare Worker compatible
- Mobile friendly
- Acode friendly

---

## Project Structure

aghil-worker/

├── index.html
├── style.css
├── app.js
├── config.js
├── memory.js
├── worker.js
└── README.md

---

## Run with Acode

Open:

index.html

Then use the Acode preview.

---

## Local Demo

The frontend works without a backend.

Memory is stored using:

localStorage

---

## Backend

worker.js is designed for:

Cloudflare Workers

API endpoint:

POST /api/chat

Example:

{
  "message": "سلام"
}

Response:

{
  "ok": true,
  "reply": "سلام 🌷 من Aghil Worker هستم. آماده‌ام."
}

---

## Security

Never put:

- OpenAI API keys
- WhatsApp access tokens
- GitHub tokens

inside:

index.html
app.js
config.js

Secrets must stay on the server.

---

## Future Versions

v1.1

- Real AI
- Persistent memory
- Cloud database

v1.2

- WhatsApp Cloud API
- Webhook
- Automatic replies

v1.3

- GitHub tools
- Web tools
- Orders

v2.0

- Autonomous Worker
- Task scheduler
- Multi-agent tools
- Voice