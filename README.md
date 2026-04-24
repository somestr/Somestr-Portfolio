# Somestr Portfolio

Interactive IT and cybersecurity portfolio with a CLI-style frontend, contact form, security event logging, and a hardened Node.js/Express backend.

## Features

- Fullscreen CLI terminal with simulated filesystem commands, tab autocomplete, command history, and shortcuts
- GUI portfolio mode with skill radar chart, project cards, themes, and contact form
- Turkish / English language toggle
- Theme switcher: Kali, Green, and Red
- Hardened backend:
  - Contact and stats rate limiting
  - IP quarantine after repeated suspicious activity
  - Decoy routes for scanners and automated probes
  - Prototype pollution guard and request body inspection
  - CSP, HSTS, COEP, COOP, CORP, Permissions-Policy, and related security headers
  - Security event logging to `security-events.jsonl`
  - Optional webhook alerts for security events

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js >= 20 |
| Framework | Express 5 |
| Frontend | Vanilla JavaScript, HTML, CSS custom properties |
| Tests | Node built-in test runner |

## Getting Started

### Prerequisites

- Node.js >= 20.0.0

### Local development

```bash
git clone https://github.com/somestr/Web_Server.git
cd Web_Server
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

### Checks

```bash
npm run check
npm test
npm run audit
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port. Most platforms set this automatically. |
| `NODE_ENV` | `development` | Set to `production` when deploying. |
| `TRUST_PROXY` | empty | Use `loopback`, `1`, or `2` when deployed behind a trusted reverse proxy. |
| `SECURITY_ALERT_WEBHOOK_URL` | empty | Optional Discord/Slack-compatible webhook for security event alerts. |
| `CONTACT_MESSAGES_FILE` | `./messages.json` | Storage path for contact form submissions. Do not commit this file. |
| `SECURITY_EVENTS_FILE` | `./security-events.jsonl` | Storage path for security events. Do not commit this file. |

## Public Release Checklist

Before making the repository public:

- Confirm `git status --short` does not show accidental runtime data, `.env` files, logs, or backup files.
- Confirm `messages.json`, `security-events.jsonl`, `.env`, and `node_modules/` are not tracked by Git.
- Review Git history for previously committed secrets or private data. If any real secret was committed, rotate it first, then clean history.
- Enable GitHub secret scanning and push protection in the repository security settings.
- Keep contact messages and security logs outside the repository. Use platform storage, a mounted volume, or a database for production.
- Review visible personal details in `public/index.html` before publishing.
- Run `npm run check`, `npm test`, and `npm run audit` before pushing a release.

## Deployment

This is a Node.js/Express app. GitHub Pages can host only the static frontend and will not run `/api/contact`, security event logging, or decoy routes. Use a Node-capable host such as Render, Railway, Fly.io, Heroku, or a VPS.

### Render

1. Create a new Web Service and connect this GitHub repository.
2. Build command: `npm install`
3. Start command: `npm start`
4. Environment variables: `NODE_ENV=production`, `TRUST_PROXY=1`

### Railway

1. Create a new project from this GitHub repository.
2. Railway can use the included `Procfile`.
3. Environment variables: `NODE_ENV=production`, `TRUST_PROXY=1`

### Fly.io

```bash
fly launch
fly secrets set NODE_ENV=production TRUST_PROXY=1
fly deploy
```

### VPS / Generic Node Host

```bash
NODE_ENV=production PORT=8080 TRUST_PROXY=loopback npm start
```

When the app is behind a reverse proxy, set `TRUST_PROXY` to match the proxy topology. Do not set it blindly if the proxy does not overwrite `X-Forwarded-*` headers.

## Security Event Report

```bash
npm run security:report
```

This prints a local summary of logged security events from `security-events.jsonl`.

## Security Policy

See [SECURITY.md](./SECURITY.md) for vulnerability reporting and public repository safety notes.

## License

[MIT](./LICENSE) (c) 2026 Sam Novak

## AI Assistance Disclosure

This project was built and refined with assistance from GitHub Copilot and OpenAI Codex. AI was used to help design and implement security middleware, tests, refactors, documentation, and UI interactions. All code has been reviewed and is understood by the author.
