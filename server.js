'use strict';

const crypto = require('node:crypto');
const express = require('express');
const path = require('node:path');
const fs = require('node:fs/promises');

const STATIC_DIR = path.join(__dirname, 'public');
const CONTACT_MESSAGES_FILE = process.env.CONTACT_MESSAGES_FILE || path.join(__dirname, 'messages.json');
const SECURITY_EVENTS_FILE = process.env.SECURITY_EVENTS_FILE || path.join(__dirname, 'security-events.jsonl');
const SECURITY_ALERT_WEBHOOK_URL = (process.env.SECURITY_ALERT_WEBHOOK_URL || '').trim();
const BODY_LIMIT = '10kb';
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX_REQUESTS = 5;
const STATS_RATE_MAX_REQUESTS = 20;
const MAX_STORED_MESSAGES = 1000;
const SERVER_REQUEST_TIMEOUT_MS = 10_000;
const SERVER_HEADERS_TIMEOUT_MS = 11_000;
const SUSPICIOUS_ACTIVITY_WINDOW_MS = 15 * 60 * 1000;
const SUSPICIOUS_ACTIVITY_THRESHOLD = 3;
const RATE_LIMIT_ESCALATION_THRESHOLD = 2;
const QUARANTINE_WINDOW_MS = 30 * 60 * 1000;
const SUPPORTED_TRUST_PROXY_SETTINGS = new Set(['loopback', 'linklocal', 'uniquelocal']);
const DECOY_ROUTE_PREFIX = '/__decoy__';
const MAX_STORE_ENTRIES = 5_000;
const FORBIDDEN_BODY_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

const SUSPICIOUS_REQUEST_PATTERNS = [
    { pattern: /(?:^|\/)\.env(?:$|[./])/i, reason: 'environment_file_probe', severity: 'high' },
    { pattern: /(?:^|\/)\.git(?:$|\/)/i, reason: 'git_metadata_probe', severity: 'high' },
    { pattern: /(?:^|\/)wp-admin(?:$|\/)|(?:^|\/)wp-login\.php$/i, reason: 'wordpress_probe', severity: 'medium' },
    { pattern: /phpmyadmin/i, reason: 'phpmyadmin_probe', severity: 'medium' },
    { pattern: /cgi-bin|boaform|autodiscover|server-status|manager\/html/i, reason: 'known_admin_probe', severity: 'medium' },
    { pattern: /vendor\/phpunit|actuator|jmx-console|solr\/admin/i, reason: 'known_rce_probe', severity: 'high' },
    { pattern: /(?:^|\/)(?:id_rsa|authorized_keys|\.aws|\.ssh)(?:$|[./])/i, reason: 'credential_probe', severity: 'high' },
];

const SUSPICIOUS_PAYLOAD_PATTERNS = [
    { pattern: /(?:\.\.\/|%2e%2e|%252e|%5c|\\)/i, reason: 'path_traversal_probe', severity: 'high' },
    { pattern: /(?:<script|%3cscript|javascript:|\$\{jndi:)/i, reason: 'injection_probe', severity: 'high' },
    { pattern: /(?:union\s+select|or\s+1=1|drop\s+table|sleep\()/i, reason: 'sqli_probe', severity: 'high' },
];

const SCANNER_USER_AGENT_PATTERNS = [
    /sqlmap/i,
    /nikto/i,
    /nuclei/i,
    /acunetix/i,
    /wpscan/i,
    /dirbuster/i,
    /gobuster/i,
    /whatweb/i,
    /zgrab/i,
    /masscan/i,
    /nessus/i,
];

function buildContentSecurityPolicy() {
    return [
        "default-src 'self'",
        "base-uri 'self'",
        "connect-src 'self'",
        "font-src 'self' data:",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "img-src 'self' data: https:",
        "object-src 'none'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
    ].join('; ');
}

function resolveTrustProxySetting(value) {
    if (!value) {
        return false;
    }

    const normalized = value.trim().toLowerCase();
    if (SUPPORTED_TRUST_PROXY_SETTINGS.has(normalized)) {
        return normalized;
    }

    if (/^\d+$/.test(normalized)) {
        return Number.parseInt(normalized, 10);
    }

    return false;
}

function createExpiringCounterStore(windowMs) {
    const entries = new Map();

    function prune(now = Date.now()) {
        for (const [key, entry] of entries) {
            if (now - entry.start > windowMs) {
                entries.delete(key);
            }
        }
    }

    function evictOldest() {
        let oldestKey = null;
        let oldestStart = Infinity;
        for (const [key, entry] of entries) {
            if (entry.start < oldestStart) {
                oldestStart = entry.start;
                oldestKey = key;
            }
        }
        if (oldestKey !== null) entries.delete(oldestKey);
    }

    return {
        increment(key) {
            const now = Date.now();
            prune(now);

            const entry = entries.get(key);
            if (!entry) {
                if (entries.size >= MAX_STORE_ENTRIES) {
                    evictOldest();
                }
                entries.set(key, { start: now, count: 1 });
                return 1;
            }

            entry.count += 1;
            return entry.count;
        },
        get(key) {
            prune();
            return entries.get(key)?.count || 0;
        },
    };
}

function createQuarantineStore(quarantineMs) {
    const entries = new Map();

    function prune(now = Date.now()) {
        for (const [key, entry] of entries) {
            if (entry.until <= now) {
                entries.delete(key);
            }
        }
    }

    return {
        get(key) {
            prune();
            return entries.get(key) || null;
        },
        set(key, details = {}) {
            const now = Date.now();
            prune(now);

            if (entries.size >= MAX_STORE_ENTRIES) {
                let soonestKey = null;
                let soonestUntil = Infinity;
                for (const [k, v] of entries) {
                    if (v.until < soonestUntil) {
                        soonestUntil = v.until;
                        soonestKey = k;
                    }
                }
                if (soonestKey !== null) entries.delete(soonestKey);
            }

            const entry = {
                until: now + quarantineMs,
                reason: details.reason || 'quarantined',
                honeypotTarget: details.honeypotTarget || `${DECOY_ROUTE_PREFIX}/ops-archive`,
            };

            entries.set(key, entry);
            return entry;
        },
    };
}

function createRateLimiter(windowMs, maxRequests) {
    const entries = new Map();

    return function checkRateLimit(key) {
        const now = Date.now();
        for (const [entryKey, activeEntry] of entries) {
            if (now - activeEntry.start > windowMs) {
                entries.delete(entryKey);
            }
        }

        const entry = entries.get(key);

        if (!entry || now - entry.start > windowMs) {
            if (entries.size >= MAX_STORE_ENTRIES) {
                const firstKey = entries.keys().next().value;
                if (firstKey !== undefined) entries.delete(firstKey);
            }
            entries.set(key, { start: now, count: 1 });
            return true;
        }

        if (entry.count >= maxRequests) {
            return false;
        }

        entry.count += 1;
        return true;
    };
}

function sanitizeInput(value, maxLength) {
    if (typeof value !== 'string') {
        return '';
    }

    return value
        .trim()
        .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '')
        .replace(/[<>"'`]/g, '')
        .slice(0, maxLength);
}

function hasPrototypePollutionKeys(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }

    return Object.keys(obj).some((k) => FORBIDDEN_BODY_KEYS.has(k));
}

function sanitizeMetadata(value, maxLength = 512) {
    if (typeof value !== 'string') {
        return '';
    }

    return value
        .replace(/[\r\n\t]+/g, ' ')
        .trim()
        .slice(0, maxLength);
}

function validateContactPayload(body) {
    if (hasPrototypePollutionKeys(body)) {
        return { ok: false, status: 400, error: 'Invalid request.' };
    }

    const name = sanitizeInput(body?.name, 100);
    const email = sanitizeInput(body?.email, 200);
    const message = sanitizeInput(body?.message, 2000);

    if (!name || !email || !message) {
        return { ok: false, status: 400, error: 'All fields are required.' };
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
        return { ok: false, status: 400, error: 'Invalid email format.' };
    }

    return {
        ok: true,
        value: { name, email, message },
    };
}

function getClientIp(req) {
    const rawIp = req.ip || req.socket?.remoteAddress || '';
    return rawIp.replace(/^::ffff:/, '');
}

function getDecoyScenarioFromLocation(location) {
    return location.startsWith(`${DECOY_ROUTE_PREFIX}/`)
        ? location.slice(DECOY_ROUTE_PREFIX.length + 1)
        : 'ops-archive';
}

function buildSecurityEvent(req, details) {
    return {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: details.type,
        severity: details.severity || 'medium',
        reason: details.reason || 'unknown',
        ip: getClientIp(req) || 'unknown',
        method: req.method,
        path: req.path,
        url: sanitizeMetadata(req.originalUrl || req.url || '', 2048),
        userAgent: sanitizeMetadata(req.get('user-agent') || ''),
        referer: sanitizeMetadata(req.get('referer') || '', 1024),
        ...(details.meta && typeof details.meta === 'object' ? details.meta : {}),
    };
}

function detectSuspiciousRequest(req) {
    const rawUrl = req.originalUrl || req.url || '';
    const normalizedUrl = sanitizeMetadata(rawUrl, 2048);
    const method = (req.method || 'GET').toUpperCase();
    const userAgent = sanitizeMetadata(req.get('user-agent') || '').toLowerCase();

    if (method === 'TRACE' || method === 'CONNECT') {
        return {
            type: 'probe_request',
            severity: 'medium',
            reason: `unsupported_method:${method.toLowerCase()}`,
        };
    }

    for (const pattern of SCANNER_USER_AGENT_PATTERNS) {
        if (pattern.test(userAgent)) {
            return {
                type: 'probe_request',
                severity: 'high',
                reason: 'scanner_user_agent',
            };
        }
    }

    for (const entry of SUSPICIOUS_REQUEST_PATTERNS) {
        if (entry.pattern.test(req.path) || entry.pattern.test(normalizedUrl)) {
            return {
                type: 'probe_request',
                severity: entry.severity,
                reason: entry.reason,
            };
        }
    }

    for (const entry of SUSPICIOUS_PAYLOAD_PATTERNS) {
        if (entry.pattern.test(normalizedUrl)) {
            return {
                type: 'probe_request',
                severity: entry.severity,
                reason: entry.reason,
            };
        }
    }

    if (['POST', 'PUT', 'PATCH'].includes(method) && req.body && typeof req.body === 'object') {
        const bodyStr = JSON.stringify(req.body);
        for (const entry of SUSPICIOUS_PAYLOAD_PATTERNS) {
            if (entry.pattern.test(bodyStr)) {
                return {
                    type: 'probe_request',
                    severity: entry.severity,
                    reason: entry.reason,
                };
            }
        }
    }

    return null;
}

function buildDecoyLocation(reason) {
    switch (reason) {
    case 'environment_file_probe':
    case 'credential_probe':
    case 'git_metadata_probe':
        return `${DECOY_ROUTE_PREFIX}/exposed-config`;
    case 'wordpress_probe':
    case 'phpmyadmin_probe':
    case 'known_admin_probe':
        return `${DECOY_ROUTE_PREFIX}/admin-portal`;
    default:
        return `${DECOY_ROUTE_PREFIX}/ops-archive`;
    }
}

function buildFakeEnvSnapshot() {
    return [
        '# legacy edge cache snapshot',
        'APP_NAME=OpsMirror Legacy Portal',
        'NODE_ENV=production',
        'SERVER_CLUSTER=edge-eu-west-1',
        'DB_HOST=db-replica-03.internal',
        'DB_PORT=5432',
        'DB_NAME=ops_archive',
        'DB_USER=svc_portal_ro',
        'DB_PASSWORD=DECOY_PASSWORD_NOT_REAL',
        'REDIS_URL=redis://cache-repl.internal:6379/2',
        'CLOUD_API_ID=DECOY_API_ID_NOT_REAL',
        'CLOUD_API_VALUE=DECOY_API_VALUE_NOT_REAL',
        'JWT_SIGNING_VALUE=DECOY_SIGNING_VALUE_NOT_REAL',
        'SESSION_COOKIE_NAME=ops.sid',
        'SMTP_HOST=mx-backup.internal',
        'SMTP_PORT=2525',
    ].join('\n');
}

function buildFakeArchivePayload() {
    return {
        ok: true,
        sync: 'completed',
        cluster: 'edge-eu-west-1',
        mirrorNode: 'ops-mirror-03',
        snapshotId: 'snap-2026-04-18T08-40Z',
        artifacts: [
            'backup-ops-2026-04-18.sql.gz',
            'users-archive-2026-04-18.ndjson',
            'tickets-cache-2026-04-18.tar',
        ],
        records: [
            { id: 7104, owner: 'svc-ops', scope: 'archive', status: 'replicated' },
            { id: 7105, owner: 'svc-audit', scope: 'ledger', status: 'replicated' },
            { id: 7106, owner: 'svc-report', scope: 'users', status: 'queued' },
        ],
    };
}

function buildFakeAdminPortalHtml() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Legacy Operations Console</title>
    <style>
        :root {
            color-scheme: dark;
            --bg: #0b1020;
            --panel: #11182b;
            --text: #d9e2f2;
            --muted: #8fa3c8;
            --accent: #57d1ff;
            --warn: #ffc857;
            --line: rgba(143, 163, 200, 0.18);
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: Consolas, "Liberation Mono", Menlo, monospace;
            background:
                radial-gradient(circle at top right, rgba(87, 209, 255, 0.12), transparent 28%),
                linear-gradient(180deg, #0b1020, #0a0f1a 55%, #08101a);
            color: var(--text);
            min-height: 100vh;
            padding: 32px 20px;
        }
        .shell {
            max-width: 1040px;
            margin: 0 auto;
            border: 1px solid var(--line);
            background: rgba(17, 24, 43, 0.88);
            backdrop-filter: blur(14px);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
        }
        .topbar {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid var(--line);
            background: rgba(255, 255, 255, 0.02);
        }
        .title {
            font-size: 14px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--accent);
        }
        .badge {
            font-size: 12px;
            color: var(--warn);
            border: 1px solid rgba(255, 200, 87, 0.3);
            border-radius: 999px;
            padding: 6px 10px;
        }
        .content {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 20px;
            padding: 20px;
        }
        .panel {
            border: 1px solid var(--line);
            border-radius: 16px;
            padding: 18px;
            background: rgba(255, 255, 255, 0.02);
        }
        h1, h2 {
            margin: 0 0 14px;
            font-size: 18px;
        }
        .muted {
            color: var(--muted);
            line-height: 1.6;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
            margin-top: 18px;
        }
        .stat {
            padding: 14px;
            border-radius: 12px;
            background: rgba(87, 209, 255, 0.06);
            border: 1px solid rgba(87, 209, 255, 0.15);
        }
        .stat strong {
            display: block;
            font-size: 22px;
            margin-top: 6px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        th, td {
            text-align: left;
            padding: 10px 8px;
            border-bottom: 1px solid var(--line);
        }
        th {
            color: var(--muted);
            font-weight: 400;
        }
        a {
            color: var(--accent);
            text-decoration: none;
        }
        @media (max-width: 860px) {
            .content {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="shell">
        <div class="topbar">
            <div class="title">Legacy Operations Console / privileged mirror</div>
            <div class="badge">Readonly replica</div>
        </div>
        <div class="content">
            <section class="panel">
                <h1>Operations Overview</h1>
                <p class="muted">Cluster synchronization completed successfully. Cached metrics and archive previews are available from the readonly mirror node.</p>
                <div class="stats">
                    <div class="stat">Active sessions<strong>184</strong></div>
                    <div class="stat">Queued exports<strong>12</strong></div>
                    <div class="stat">Sync lag<strong>03s</strong></div>
                </div>
                <h2 style="margin-top:20px;">Recent privileged actions</h2>
                <table>
                    <thead>
                        <tr><th>User</th><th>Scope</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>svc-ops-repl</td><td>Archive Sync</td><td>Completed</td></tr>
                        <tr><td>audit-reader</td><td>Billing Mirror</td><td>Completed</td></tr>
                        <tr><td>report-export</td><td>User Snapshot</td><td>Queued</td></tr>
                    </tbody>
                </table>
            </section>
            <aside class="panel">
                <h2>Quick Access</h2>
                <table>
                    <tbody>
                        <tr><td>Config cache</td><td><a href="${DECOY_ROUTE_PREFIX}/exposed-config">open</a></td></tr>
                        <tr><td>Archive preview</td><td><a href="${DECOY_ROUTE_PREFIX}/ops-archive">open</a></td></tr>
                        <tr><td>Mirror node</td><td>ops-mirror-03</td></tr>
                        <tr><td>Region</td><td>eu-west-1</td></tr>
                    </tbody>
                </table>
            </aside>
        </div>
    </div>
</body>
</html>`;
}

function sendDecoyResponse(res, scenario) {
    res.setHeader('Cache-Control', 'no-store');

    switch (scenario) {
    case 'exposed-config':
        return res.status(200).type('text/plain').send(buildFakeEnvSnapshot());
    case 'admin-portal':
        return res.status(200).type('html').send(buildFakeAdminPortalHtml());
    case 'ops-archive':
        return res.status(200).json(buildFakeArchivePayload());
    default:
        return res.status(404).type('text/plain').send('Not found.');
    }
}

async function appendJsonLine(filePath, payload) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.appendFile(filePath, `${JSON.stringify(payload)}\n`, 'utf8');
}

async function notifySecurityWebhook(event) {
    if (!SECURITY_ALERT_WEBHOOK_URL) {
        return;
    }

    try {
        await fetch(SECURITY_ALERT_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
            signal: AbortSignal.timeout(3000),
        });
    } catch (error) {
        console.error('[SECURITY][WEBHOOK]', error.message);
    }
}

async function logSecurityEvent(event) {
    console.warn(`[SECURITY] ${event.type} ${event.reason} from ${event.ip} on ${event.method} ${event.url}`);

    try {
        await appendJsonLine(SECURITY_EVENTS_FILE, event);
    } catch (error) {
        console.error('[SECURITY][LOG]', error.message);
    }

    void notifySecurityWebhook(event);
}

async function readStoredMessages() {
    try {
        const content = await fs.readFile(CONTACT_MESSAGES_FILE, 'utf8');
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        if (error.code === 'ENOENT' || error instanceof SyntaxError) {
            return [];
        }

        throw error;
    }
}

async function storeMessage(entry) {
    const messages = await readStoredMessages();
    if (messages.length >= MAX_STORED_MESSAGES) {
        messages.splice(0, messages.length - MAX_STORED_MESSAGES + 1);
    }
    messages.push(entry);
    await fs.writeFile(CONTACT_MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf8');
}

function sendApiError(res, status, error) {
    return res.status(status).json({ ok: false, error });
}

function sendPlainNotFound(res) {
    return res.status(404).type('text/plain').send('Not found.');
}

function isJsonRequest(req) {
    return Boolean(req.is(['application/json', 'application/*+json']));
}

function isAllowedBrowserFormPost(req) {
    const fetchSite = (req.get('sec-fetch-site') || '').toLowerCase();
    if (fetchSite === 'cross-site') {
        return false;
    }

    const originHeader = req.get('origin');
    if (!originHeader) {
        return true;
    }

    try {
        const origin = new URL(originHeader);
        const requestHost = req.get('host');
        return origin.host === requestHost && origin.protocol === `${req.protocol}:`;
    } catch {
        return false;
    }
}

function shouldServeIndex(req) {
    if (req.method !== 'GET') {
        return false;
    }

    if (req.path === '/') {
        return true;
    }

    if (path.posix.extname(req.path)) {
        return false;
    }

    const acceptHeader = req.get('accept') || '';
    return acceptHeader.includes('text/html');
}

function createApp() {
    const app = express();
    const checkRateLimit = createRateLimiter(RATE_WINDOW_MS, RATE_MAX_REQUESTS);
    const checkStatsRateLimit = createRateLimiter(RATE_WINDOW_MS, STATS_RATE_MAX_REQUESTS);
    const suspiciousActivityStore = createExpiringCounterStore(SUSPICIOUS_ACTIVITY_WINDOW_MS);
    const rateLimitViolationStore = createExpiringCounterStore(SUSPICIOUS_ACTIVITY_WINDOW_MS);
    const quarantineStore = createQuarantineStore(QUARANTINE_WINDOW_MS);
    let visitorCount = 0;
    const serverStartedAt = Date.now();

    async function quarantineIp(req, details) {
        const ip = getClientIp(req) || 'unknown';
        if (quarantineStore.get(ip)) {
            return quarantineStore.get(ip);
        }

        const quarantineEntry = quarantineStore.set(ip, details);
        await logSecurityEvent(buildSecurityEvent(req, {
            type: 'ip_quarantined',
            severity: 'high',
            reason: details.reason,
            meta: {
                honeypotTarget: quarantineEntry.honeypotTarget,
                quarantineUntil: new Date(quarantineEntry.until).toISOString(),
            },
        }));
        return quarantineEntry;
    }

    async function recordSuspiciousActivity(req, details) {
        const ip = getClientIp(req) || 'unknown';
        const activityCount = suspiciousActivityStore.increment(ip);

        if (activityCount >= SUSPICIOUS_ACTIVITY_THRESHOLD) {
            await quarantineIp(req, {
                reason: 'repeated_suspicious_activity',
                honeypotTarget: details.honeypotTarget,
            });
        }
    }

    app.set('trust proxy', resolveTrustProxySetting(process.env.TRUST_PROXY));
    app.disable('x-powered-by');
    app.use(express.json({ limit: BODY_LIMIT, strict: true, type: ['application/json', 'application/*+json'] }));

    app.use((req, res, next) => {
        if (req.path.startsWith('/api/')) {
            res.setHeader('Cache-Control', 'no-store');
        }

        res.setHeader('Content-Security-Policy', buildContentSecurityPolicy());
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
        res.setHeader('Origin-Agent-Cluster', '?1');
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), autoplay=(), picture-in-picture=(self)');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-DNS-Prefetch-Control', 'off');
        res.setHeader('X-Download-Options', 'noopen');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
        res.setHeader('X-XSS-Protection', '0');
        if (req.protocol === 'https' || req.get('x-forwarded-proto') === 'https') {
            res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
        }
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        next();
    });

    app.use(async (req, res, next) => {
        if (req.path.startsWith(DECOY_ROUTE_PREFIX)) {
            return next();
        }

        const clientIp = getClientIp(req) || 'unknown';
        const quarantineEntry = quarantineStore.get(clientIp);
        if (quarantineEntry) {
            await logSecurityEvent(buildSecurityEvent(req, {
                type: 'quarantine_redirect',
                severity: 'high',
                reason: quarantineEntry.reason,
                meta: {
                    honeypotTarget: quarantineEntry.honeypotTarget,
                },
            }));

            if (req.method === 'GET' || req.method === 'HEAD') {
                return res.redirect(302, quarantineEntry.honeypotTarget);
            }

            return sendDecoyResponse(res, getDecoyScenarioFromLocation(quarantineEntry.honeypotTarget));
        }

        const suspiciousRequest = detectSuspiciousRequest(req);
        if (!suspiciousRequest) {
            return next();
        }

        const honeypotTarget = buildDecoyLocation(suspiciousRequest.reason);
        await logSecurityEvent(buildSecurityEvent(req, {
            ...suspiciousRequest,
            meta: {
                honeypotTarget,
            },
        }));
        await recordSuspiciousActivity(req, { honeypotTarget });

        if (req.method === 'GET' || req.method === 'HEAD') {
            return res.redirect(302, honeypotTarget);
        }

        return sendDecoyResponse(res, 'ops-archive');
    });

    app.get(`${DECOY_ROUTE_PREFIX}/:scenario`, async (req, res) => {
        const scenario = req.params.scenario;
        await logSecurityEvent(buildSecurityEvent(req, {
            type: 'honeypot_engaged',
            severity: 'medium',
            reason: `decoy_${scenario}`,
        }));

        return sendDecoyResponse(res, scenario);
    });

    app.use(express.static(STATIC_DIR, {
        etag: true,
        maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
    }));

    app.post('/api/contact', async (req, res, next) => {
        try {
            if (!isJsonRequest(req)) {
                return sendApiError(res, 415, 'Content-Type must be application/json.');
            }

            if (!isAllowedBrowserFormPost(req)) {
                await logSecurityEvent(buildSecurityEvent(req, {
                    type: 'cross_site_post_blocked',
                    severity: 'high',
                    reason: 'cross_site_contact_post',
                }));
                await recordSuspiciousActivity(req, {
                    honeypotTarget: `${DECOY_ROUTE_PREFIX}/ops-archive`,
                });
                return sendApiError(res, 403, 'Cross-site form submissions are not allowed.');
            }

            const clientIp = getClientIp(req) || 'unknown';
            if (!checkRateLimit(clientIp)) {
                await logSecurityEvent(buildSecurityEvent(req, {
                    type: 'rate_limit_exceeded',
                    severity: 'medium',
                    reason: 'contact_form_rate_limit',
                }));

                const rateLimitViolations = rateLimitViolationStore.increment(clientIp);
                if (rateLimitViolations >= RATE_LIMIT_ESCALATION_THRESHOLD) {
                    await quarantineIp(req, {
                        reason: 'repeated_rate_limit_abuse',
                        honeypotTarget: `${DECOY_ROUTE_PREFIX}/ops-archive`,
                    });
                }

                return sendApiError(res, 429, 'Too many requests. Please wait.');
            }

            const validation = validateContactPayload(req.body);
            if (!validation.ok) {
                return sendApiError(res, validation.status, validation.error);
            }

            const entry = {
                id: crypto.randomUUID(),
                ...validation.value,
                date: new Date().toISOString(),
                ip: clientIp,
            };

            await storeMessage(entry);

            console.log(`[CONTACT] New message from ${entry.name} <${entry.email}>`);
            return res.json({ ok: true, message: 'Message received successfully.' });
        } catch (error) {
            return next(error);
        }
    });

    app.get('/api/stats', (req, res) => {
        const clientIp = getClientIp(req) || 'unknown';
        if (!checkStatsRateLimit(clientIp)) {
            return sendApiError(res, 429, 'Too many requests. Please wait.');
        }
        visitorCount += 1;
        res.json({
            visitors: visitorCount,
            uptime: Math.floor((Date.now() - serverStartedAt) / 1000),
        });
    });

    app.use('/api', (req, res) => {
        sendApiError(res, 404, 'Not found.');
    });

    app.get('/{*splat}', (req, res) => {
        if (!shouldServeIndex(req)) {
            return sendPlainNotFound(res);
        }

        return res.sendFile(path.join(STATIC_DIR, 'index.html'));
    });

    app.use(async (error, req, res, next) => {
        if (res.headersSent) {
            return next(error);
        }

        if (error?.type === 'entity.parse.failed') {
            await logSecurityEvent(buildSecurityEvent(req, {
                type: 'malformed_json',
                severity: 'medium',
                reason: 'json_parse_failure',
            }));
            await recordSuspiciousActivity(req, {
                honeypotTarget: `${DECOY_ROUTE_PREFIX}/ops-archive`,
            });

            return sendApiError(res, 400, 'Invalid JSON payload.');
        }

        console.error('[SERVER]', error);

        if (req.path.startsWith('/api/')) {
            return sendApiError(res, 500, 'Internal server error.');
        }

        return res.status(500).type('text/plain').send('Internal server error.');
    });

    return app;
}

function resolvePort() {
    const rawPort = process.env.PORT;
    if (rawPort === undefined) {
        return 3000;
    }

    const parsedPort = Number.parseInt(rawPort, 10);
    return Number.isNaN(parsedPort) ? 3000 : parsedPort;
}

function startServer(port = resolvePort()) {
    const app = createApp();

    const server = app.listen(port, () => {
        console.log(`
╔══════════════════════════════════════════╗
║   OBA Server Active                     ║
║   http://localhost:${port}                      ║
║   Environment: ${process.env.NODE_ENV || 'development'}               ║
╚══════════════════════════════════════════╝
        `);
    });

    server.requestTimeout = SERVER_REQUEST_TIMEOUT_MS;
    server.headersTimeout = SERVER_HEADERS_TIMEOUT_MS;
    return server;
}

if (require.main === module) {
    startServer();
}

module.exports = {
    buildContentSecurityPolicy,
    buildDecoyLocation,
    createApp,
    detectSuspiciousRequest,
    getClientIp,
    logSecurityEvent,
    sanitizeInput,
    sendDecoyResponse,
    startServer,
    validateContactPayload,
};
