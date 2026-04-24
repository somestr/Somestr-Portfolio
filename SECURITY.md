# Security Policy

## Supported Versions

The public repository tracks the latest `main` branch only. Security fixes should be applied to `main` first.

## Reporting a Vulnerability

If you find a vulnerability, do not open a public issue with exploit details. Contact the repository owner privately with:

- A short description of the issue
- Affected route, file, or behavior
- Reproduction steps
- Expected impact

Do not include real secrets, private keys, cookies, tokens, or personal data in reports.

## Public Repository Safety

The following files are runtime data and must not be committed:

- `.env`
- `.env.*`
- `messages.json`
- `security-events.jsonl`
- log files

If a real secret is ever committed, rotate or revoke it before attempting history cleanup. Removing it from the latest commit is not enough because Git history may still expose it.

## Production Notes

- In GitHub Pages static mode, this app does not receive server-side requests and cannot collect visitor IPs, contact messages, security events, or webhook alerts. GitHub/CDN infrastructure may have its own access logs, but they are not available to this application.
- Treat IP logging, decoy routes, quarantine behavior, and webhook alerts as Node backend features only.
- Run the app behind HTTPS in production.
- Set `NODE_ENV=production`.
- Set `TRUST_PROXY` only to match the actual trusted proxy chain.
- Store contact messages and security event logs in persistent storage outside the repository.
- Enable GitHub secret scanning and push protection for the public repository.
