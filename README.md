# OBA Portfolio — Sam Novak

> IT & Cybersecurity Portfolio — interactive CLI terminal, radar chart, dark-mode GUI, contact form, and a hardened Node.js/Express backend.

---

## Features

- **Fullscreen CLI terminal** — simulated filesystem, `ls`, `cd`, `cat`, `tree`, tab autocomplete, command history (↑/↓), Ctrl+L
- **GUI mode** — visual portfolio with skill radar chart, project cards, and contact form
- **i18n** — Turkish / English language toggle
- **Theme switcher** — Kali (default), Green, Red
- **Hardened backend**
  - Rate limiting (contact: 5 req/min, stats: 20 req/min)
  - IP quarantine after repeated suspicious activity
  - Honeypot/decoy routes for scanners & bots
  - Prototype pollution guard, request body inspection
  - CSP, HSTS, COEP, COOP, CORP, Permissions-Policy, and more
  - Security event logging to `security-events.jsonl`
  - Optional webhook alerts (Discord / Slack)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 20 |
| Framework | Express 5 |
| Frontend | Vanilla JS, CSS custom properties |
| Tests | Node built-in test runner (21 tests) |

---

## Getting Started

### Prerequisites

- Node.js **≥ 20.0.0**

### Local development

```bash
# 1. Clone the repo
git clone https://github.com/som_sec/portfolio.git
cd Web_Server

# 2. Install dependencies
npm install

# 3. Copy env template and edit if needed
cp .env.example .env

# 4. Start dev server (auto-restarts on file change)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Run tests

```bash
npm test
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port (set automatically on most platforms) |
| `NODE_ENV` | `development` | Set to `production` when deploying |
| `TRUST_PROXY` | _(empty)_ | `loopback` / `1` / `2` for platforms behind a reverse proxy |
| `SECURITY_ALERT_WEBHOOK_URL` | _(empty)_ | Discord or Slack webhook for real-time security alerts |
| `CONTACT_MESSAGES_FILE` | `./messages.json` | Override storage path for contact form submissions |
| `SECURITY_EVENTS_FILE` | `./security-events.jsonl` | Override storage path for security events |

---

## Deployment

The app reads `PORT` and `NODE_ENV` from environment variables and works on any platform that runs Node.js.

### Render

1. New → **Web Service** → connect your GitHub repo
2. Build command: `npm install`
3. Start command: `npm start`
4. Add env var: `NODE_ENV=production`, `TRUST_PROXY=1`

### Railway

1. New Project → **Deploy from GitHub repo**
2. Railway auto-detects `npm start` via `Procfile`
3. Add env var: `NODE_ENV=production`, `TRUST_PROXY=1`

### Heroku

```bash
heroku create
heroku config:set NODE_ENV=production TRUST_PROXY=1
git push heroku main
```

### Fly.io

```bash
fly launch        # follow prompts, select Node
fly secrets set NODE_ENV=production TRUST_PROXY=1
fly deploy
```

### VPS / Docker (generic)

```bash
NODE_ENV=production PORT=8080 node server.js
```

> **Note:** On platforms that sit behind a reverse proxy (Render, Railway, Heroku, Fly), always set `TRUST_PROXY=1` so that client IPs are read correctly from `X-Forwarded-For`.

---

## Security Report CLI

```bash
npm run security:report
```

Prints a summary of logged security events from `security-events.jsonl`.

---

## License

[MIT](./LICENSE) © 2026 Sam Novak

---

## AI Assistance Disclosure

This project was built with the assistance of **GitHub Copilot** (powered by Claude Sonnet). AI was used to help design and implement the security middleware, write tests, debug encoding issues, and refine UI interactions. All code has been reviewed and is understood by the author.
