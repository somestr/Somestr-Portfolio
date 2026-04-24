const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

async function createTempLogFile(events) {
    const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'security-report-'));
    const logFile = path.join(rootDir, 'security-events.jsonl');
    const content = events.map((event) => JSON.stringify(event)).join('\n');
    await fs.writeFile(logFile, `${content}\n`, 'utf8');
    return logFile;
}

async function runReport(args = []) {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, ['scripts/security-events-report.js', ...args], {
            cwd: __dirname,
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (chunk) => {
            stdout += chunk.toString();
        });
        child.stderr.on('data', (chunk) => {
            stderr += chunk.toString();
        });

        child.on('error', reject);
        child.on('exit', (code) => {
            resolve({ code, stdout, stderr });
        });
    });
}

test('security events CLI prints summary, type counts and top IPs', async () => {
    const logFile = await createTempLogFile([
        {
            timestamp: '2026-04-18T10:00:00.000Z',
            type: 'probe_request',
            reason: 'environment_file_probe',
            ip: '10.0.0.5',
            method: 'GET',
            path: '/.env',
            url: '/.env',
        },
        {
            timestamp: '2026-04-18T10:00:05.000Z',
            type: 'rate_limit_exceeded',
            reason: 'contact_form_rate_limit',
            ip: '10.0.0.5',
            method: 'POST',
            path: '/api/contact',
            url: '/api/contact',
        },
        {
            timestamp: '2026-04-18T10:01:00.000Z',
            type: 'cross_site_post_blocked',
            reason: 'cross_site_contact_post',
            ip: '192.168.1.15',
            method: 'POST',
            path: '/api/contact',
            url: '/api/contact',
        },
    ]);

    const result = await runReport(['--file', logFile, '--limit', '2']);

    assert.equal(result.code, 0);
    assert.match(result.stdout, /Total events:\s+3/);
    assert.match(result.stdout, /Unique IPs:\s+2/);
    assert.match(result.stdout, /probe_request:\s+1/);
    assert.match(result.stdout, /10\.0\.0\.5:\s+2/);
    assert.match(result.stdout, /Recent events/i);
    assert.equal(result.stderr, '');
});

test('security events CLI can filter by IP and emit JSON', async () => {
    const logFile = await createTempLogFile([
        {
            timestamp: '2026-04-18T10:00:00.000Z',
            type: 'probe_request',
            reason: 'environment_file_probe',
            ip: '10.0.0.5',
            method: 'GET',
            path: '/.env',
            url: '/.env',
        },
        {
            timestamp: '2026-04-18T10:01:00.000Z',
            type: 'cross_site_post_blocked',
            reason: 'cross_site_contact_post',
            ip: '192.168.1.15',
            method: 'POST',
            path: '/api/contact',
            url: '/api/contact',
        },
    ]);

    const result = await runReport(['--file', logFile, '--ip', '192.168.1.15', '--json']);

    assert.equal(result.code, 0);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.summary.totalEvents, 1);
    assert.equal(payload.summary.uniqueIps, 1);
    assert.equal(payload.recentEvents[0].ip, '192.168.1.15');
    assert.equal(payload.recentEvents[0].type, 'cross_site_post_blocked');
    assert.equal(result.stderr, '');
});
