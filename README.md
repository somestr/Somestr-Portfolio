# Somestr Portfolio

Interactive IT and cybersecurity portfolio with a CLI-style frontend, static GitHub Pages deployment, and an optional hardened Node.js/Express backend for local/demo security features.

## Features

- Fullscreen CLI terminal with simulated filesystem commands, tab autocomplete, command history, and shortcuts
- GUI portfolio mode with skill radar chart, project cards, themes, and contact form
- Turkish / English language toggle
- Theme switcher: Kali, Green, and Red
- Free static deployment through GitHub Pages and GitHub Actions
- Optional hardened backend:
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
| Static hosting | GitHub Pages |

## Getting Started

### Prerequisites

- Node.js >= 20.0.0

### Local development

```bash
git clone https://github.com/somestr/Somestr-Portfolio.git
cd Somestr-Portfolio
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

GitHub Pages deploys the static site from `public/`. The Node server is only needed for local development or optional dynamic backend hosting.

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

Before and after public releases:

- Confirm `git status --short` does not show accidental runtime data, `.env` files, logs, or backup files.
- Confirm `messages.json`, `security-events.jsonl`, `.env`, and `node_modules/` are not tracked by Git.
- Review Git history for previously committed secrets or private data. If any real secret was committed, rotate it first, then clean history.
- Enable GitHub secret scanning and push protection in the repository security settings.
- Keep contact messages and security logs outside the repository. Static GitHub Pages does not store them.
- Review visible personal details in `public/index.html` before publishing.
- Run `npm run check`, `npm test`, and `npm run audit` before pushing a release.

## Deployment

### GitHub Pages (free static mode)

This repository is configured to deploy `public/` with GitHub Actions, so no paid service is required for the public portfolio.

1. Go to repository `Settings > Pages`.
2. Set `Source` to `GitHub Actions`.
3. Push to `main` and wait for the `Deploy GitHub Pages` workflow.
4. The expected project URL is `https://somestr.github.io/Somestr-Portfolio/`.

Static mode limitations:

- `/api/contact`, `/api/stats`, security event logging, webhook alerts, and decoy routes do not run on GitHub Pages.
- The contact form shows a static-mode notice instead of pretending the message was sent.
- The server status card shows `STATIC`.

### Local / optional Node backend

Use this mode when you want the backend demo features locally:

```bash
npm run dev
```

If you later want live contact storage, IP-based security logging, or webhook alerts on the public site, use a Node-capable host and persistent storage. When the app is behind a reverse proxy, set `TRUST_PROXY` to match the proxy topology. Do not set it blindly if the proxy does not overwrite `X-Forwarded-*` headers.

## Security Event Report

```bash
npm run security:report
```

This prints a local summary of logged security events from `security-events.jsonl`.

## Security Policy

See [SECURITY.md](./SECURITY.md) for vulnerability reporting and public repository safety notes.

## License

[MIT](./LICENSE) (c) 2026 somestr

## AI Assistance Disclosure

This project was built and refined with assistance from GitHub Copilot and OpenAI Codex. AI was used to help design and implement security middleware, tests, refactors, documentation, and UI interactions. All code has been reviewed and is understood by the author.
