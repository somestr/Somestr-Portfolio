const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const net = require('node:net');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

async function getFreePort() {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(0, () => {
            const address = server.address();
            server.close((closeError) => {
                if (closeError) {
                    reject(closeError);
                    return;
                }

                resolve(address.port);
            });
        });
        server.on('error', reject);
    });
}

async function waitForServer(baseUrl, attempts = 40) {
    for (let index = 0; index < attempts; index += 1) {
        try {
            const response = await fetch(`${baseUrl}/api/stats`);
            if (response.ok) {
                return;
            }
        } catch {}

        await new Promise((resolve) => setTimeout(resolve, 150));
    }

    throw new Error(`Server did not start at ${baseUrl}`);
}

async function createTempPaths() {
    const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'web-server-tests-'));
    return {
        rootDir,
        messagesFile: path.join(rootDir, 'messages.json'),
        securityEventsFile: path.join(rootDir, 'security-events.jsonl'),
    };
}

async function readJsonLines(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return content
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => JSON.parse(line));
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }

        throw error;
    }
}

async function startServer(envOverrides = {}) {
    const port = await getFreePort();
    const tempPaths = await createTempPaths();
    const child = spawn(process.execPath, ['server.js'], {
        cwd: __dirname,
        env: {
            ...process.env,
            NODE_ENV: 'test',
            PORT: String(port),
            CONTACT_MESSAGES_FILE: tempPaths.messagesFile,
            SECURITY_EVENTS_FILE: tempPaths.securityEventsFile,
            SECURITY_ALERTS_ENABLED: 'false',
            ...envOverrides,
        },
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    const output = [];
    child.stdout.on('data', (chunk) => output.push(chunk.toString()));
    child.stderr.on('data', (chunk) => output.push(chunk.toString()));

    const baseUrl = `http://127.0.0.1:${port}`;
    await waitForServer(baseUrl);

    return {
        baseUrl,
        stop: async () => {
            if (child.exitCode !== null) {
                return;
            }

            child.kill();
            await new Promise((resolve) => child.once('exit', resolve));
        },
        output,
        tempPaths,
    };
}

test('GET /api/unknown returns a JSON 404 instead of the SPA shell', async () => {
    const server = await startServer();

    try {
        const response = await fetch(`${server.baseUrl}/api/unknown`);
        const contentType = response.headers.get('content-type') || '';
        const payload = contentType.includes('application/json')
            ? await response.json()
            : await response.text();

        assert.equal(response.status, 404);
        assert.match(contentType, /application\/json/i);
        assert.deepEqual(payload, { ok: false, error: 'Not found.' });
    } finally {
        await server.stop();
    }
});

test('POST /api/contact rejects non-JSON payloads with 415', async () => {
    const server = await startServer();

    try {
        const response = await fetch(`${server.baseUrl}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: 'name=test',
        });

        const payload = await response.json();

        assert.equal(response.status, 415);
        assert.deepEqual(payload, {
            ok: false,
            error: 'Content-Type must be application/json.',
        });
    } finally {
        await server.stop();
    }
});

test('POST /api/contact returns a structured 400 for malformed JSON bodies', async () => {
    const server = await startServer();

    try {
        const response = await fetch(`${server.baseUrl}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: '{"name":"test"',
        });

        const payload = await response.json();

        assert.equal(response.status, 400);
        assert.deepEqual(payload, {
            ok: false,
            error: 'Invalid JSON payload.',
        });
    } finally {
        await server.stop();
    }
});

test('GET /api/stats sends hardened headers for browser clients', async () => {
    const server = await startServer();

    try {
        const response = await fetch(`${server.baseUrl}/api/stats`);
        const payload = await response.json();

        assert.equal(response.status, 200);
        assert.equal(typeof payload.visitors, 'number');
        assert.equal(typeof payload.uptime, 'number');
        assert.equal(response.headers.get('x-powered-by'), null);
        assert.match(response.headers.get('content-security-policy') || '', /default-src 'self'/);
        assert.match(response.headers.get('cache-control') || '', /no-store/i);
        assert.equal(response.headers.get('x-dns-prefetch-control'), 'off');
        assert.equal(response.headers.get('x-permitted-cross-domain-policies'), 'none');
    } finally {
        await server.stop();
    }
});

test('GET /.env redirects suspicious probes into a fake exposed-config honeypot', async () => {
    const server = await startServer({
        REAL_ENV_SHOULD_NOT_LEAK: 'super-secret-real-value',
    });

    try {
        const response = await fetch(`${server.baseUrl}/.env`, {
            redirect: 'manual',
        });
        const events = await readJsonLines(server.tempPaths.securityEventsFile);
        const probeEvent = events.find((event) => event.type === 'probe_request');

        assert.equal(response.status, 302);
        assert.match(response.headers.get('location') || '', /__decoy__\/exposed-config/);
        assert.equal(probeEvent.ip, '127.0.0.1');
        assert.equal(probeEvent.path, '/.env');
        assert.equal(probeEvent.method, 'GET');
    } finally {
        await server.stop();
    }
});

test('the fake exposed-config honeypot serves believable decoy data without leaking real env values', async () => {
    const server = await startServer({
        REAL_ENV_SHOULD_NOT_LEAK: 'super-secret-real-value',
    });

    try {
        const initialResponse = await fetch(`${server.baseUrl}/.env`, {
            redirect: 'manual',
        });
        const honeypotLocation = initialResponse.headers.get('location');
        const honeypotResponse = await fetch(new URL(honeypotLocation, server.baseUrl));
        const honeypotBody = await honeypotResponse.text();

        assert.equal(honeypotResponse.status, 200);
        assert.match(honeypotBody, /APP_NAME=/);
        assert.match(honeypotBody, /DB_PASSWORD=/);
        assert.doesNotMatch(honeypotBody, /super-secret-real-value/);
    } finally {
        await server.stop();
    }
});

test('contact form rate limit violations create a security event with the source IP', async () => {
    const server = await startServer();

    try {
        const payload = {
            name: 'Test User',
            email: 'test@example.com',
            message: 'Security rate limit regression test.',
        };

        for (let attempt = 0; attempt < 5; attempt += 1) {
            const response = await fetch(`${server.baseUrl}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            assert.equal(response.status, 200);
        }

        const blockedResponse = await fetch(`${server.baseUrl}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const blockedPayload = await blockedResponse.json();
        const events = await readJsonLines(server.tempPaths.securityEventsFile);
        const lastEvent = events.at(-1);

        assert.equal(blockedResponse.status, 429);
        assert.equal(blockedPayload.ok, false);
        assert.equal(lastEvent.type, 'rate_limit_exceeded');
        assert.equal(lastEvent.ip, '127.0.0.1');
        assert.equal(lastEvent.path, '/api/contact');
    } finally {
        await server.stop();
    }
});

test('known scanner user agents are redirected into the honeypot and logged', async () => {
    const server = await startServer();

    try {
        const response = await fetch(`${server.baseUrl}/`, {
            headers: {
                'User-Agent': 'sqlmap/1.8.4#stable',
            },
            redirect: 'manual',
        });

        const events = await readJsonLines(server.tempPaths.securityEventsFile);
        const probeEvent = events.find((event) => event.reason === 'scanner_user_agent');

        assert.equal(response.status, 302);
        assert.match(response.headers.get('location') || '', /__decoy__/);
        assert.equal(probeEvent.type, 'probe_request');
        assert.equal(probeEvent.ip, '127.0.0.1');
    } finally {
        await server.stop();
    }
});

test('repeated suspicious probes quarantine the source IP and trap later normal requests', async () => {
    const server = await startServer();

    try {
        const suspiciousPaths = ['/.env', '/.git/config', '/wp-admin'];
        for (const suspiciousPath of suspiciousPaths) {
            const response = await fetch(`${server.baseUrl}${suspiciousPath}`, {
                redirect: 'manual',
            });

            assert.equal(response.status, 302);
        }

        const followUpResponse = await fetch(`${server.baseUrl}/`, {
            redirect: 'manual',
        });

        const events = await readJsonLines(server.tempPaths.securityEventsFile);
        const quarantineEvent = events.find((event) => event.type === 'ip_quarantined');
        const redirectEvent = events.at(-1);

        assert.equal(followUpResponse.status, 302);
        assert.match(followUpResponse.headers.get('location') || '', /__decoy__/);
        assert.equal(quarantineEvent.ip, '127.0.0.1');
        assert.equal(redirectEvent.type, 'quarantine_redirect');
    } finally {
        await server.stop();
    }
});

test('cross-site browser posts to contact are blocked and logged as suspicious', async () => {
    const server = await startServer();

    try {
        const response = await fetch(`${server.baseUrl}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Origin: 'https://evil.example',
                'Sec-Fetch-Site': 'cross-site',
            },
            body: JSON.stringify({
                name: 'Mallory',
                email: 'mallory@example.com',
                message: 'Cross-site attempt.',
            }),
        });

        const payload = await response.json();
        const events = await readJsonLines(server.tempPaths.securityEventsFile);
        const blockedEvent = events.find((event) => event.type === 'cross_site_post_blocked');

        assert.equal(response.status, 403);
        assert.equal(payload.ok, false);
        assert.equal(payload.error, 'Cross-site form submissions are not allowed.');
        assert.equal(blockedEvent.ip, '127.0.0.1');
        assert.equal(blockedEvent.path, '/api/contact');
    } finally {
        await server.stop();
    }
});

test('POST /api/contact with SQL injection in body is blocked and logged as a probe', async () => {
    const server = await startServer();

    try {
        const response = await fetch(`${server.baseUrl}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "' OR 1=1 --",
                email: 'hacker@example.com',
                message: 'union select * from users',
            }),
        });

        const body = await response.json();
        const events = await readJsonLines(server.tempPaths.securityEventsFile);
        const probeEvent = events.find((e) => e.reason === 'sqli_probe');

        assert.ok(probeEvent, 'sqli_probe event should be logged');
        assert.equal(probeEvent.severity, 'high');
        assert.notEqual(body.message, 'Message received successfully.');
    } finally {
        await server.stop();
    }
});

test('POST /api/contact with prototype pollution keys returns 400', async () => {
    const server = await startServer();

    try {
        const response = await fetch(`${server.baseUrl}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                constructor: { isAdmin: true },
                name: 'Attacker',
                email: 'attacker@example.com',
                message: 'Prototype pollution test.',
            }),
        });

        const payload = await response.json();

        assert.equal(response.status, 400);
        assert.equal(payload.ok, false);
        assert.equal(payload.error, 'Invalid request.');
    } finally {
        await server.stop();
    }
});

test('GET /api/stats is rate limited after exceeding the per-minute threshold', async () => {
    const server = await startServer();

    try {
        let lastStatus;
        for (let i = 0; i < 25; i += 1) {
            const response = await fetch(`${server.baseUrl}/api/stats`);
            lastStatus = response.status;
            if (response.status === 429) break;
        }

        assert.equal(lastStatus, 429, '/api/stats should return 429 after rate limit is exceeded');
    } finally {
        await server.stop();
    }
});

test('GET /api/stats includes Cross-Origin-Embedder-Policy header', async () => {
    const server = await startServer();

    try {
        const response = await fetch(`${server.baseUrl}/api/stats`);

        assert.equal(response.status, 200);
        assert.equal(response.headers.get('cross-origin-embedder-policy'), 'require-corp');
    } finally {
        await server.stop();
    }
});
