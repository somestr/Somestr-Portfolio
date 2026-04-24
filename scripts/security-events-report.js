'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const DEFAULT_LIMIT = 10;

function printUsage() {
    console.log([
        'Usage: node scripts/security-events-report.js [options]',
        '',
        'Options:',
        '  --file <path>   Path to security-events.jsonl',
        '  --limit <n>     Number of recent events to include (default: 10)',
        '  --ip <addr>     Filter by IP address',
        '  --type <name>   Filter by event type',
        '  --json          Emit machine-readable JSON',
        '  --help          Show this help message',
    ].join('\n'));
}

function parseArgs(argv) {
    const options = {
        file: process.env.SECURITY_EVENTS_FILE || path.resolve(process.cwd(), 'security-events.jsonl'),
        limit: DEFAULT_LIMIT,
        ip: null,
        type: null,
        json: false,
        help: false,
    };

    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];

        switch (arg) {
        case '--file':
            options.file = path.resolve(process.cwd(), argv[index + 1] || '');
            index += 1;
            break;
        case '--limit':
            options.limit = Number.parseInt(argv[index + 1] || '', 10);
            index += 1;
            break;
        case '--ip':
            options.ip = argv[index + 1] || null;
            index += 1;
            break;
        case '--type':
            options.type = argv[index + 1] || null;
            index += 1;
            break;
        case '--json':
            options.json = true;
            break;
        case '--help':
            options.help = true;
            break;
        default:
            throw new Error(`Unknown argument: ${arg}`);
        }
    }

    if (!Number.isInteger(options.limit) || options.limit < 1) {
        throw new Error('--limit must be a positive integer');
    }

    return options;
}

async function readJsonLines(filePath) {
    let content;
    try {
        content = await fs.readFile(filePath, 'utf8');
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }

        throw error;
    }

    const lines = content.split('\n');
    const events = [];

    for (let lineNumber = 0; lineNumber < lines.length; lineNumber += 1) {
        const line = lines[lineNumber].trim();
        if (!line) {
            continue;
        }

        try {
            events.push(JSON.parse(line));
        } catch (error) {
            throw new Error(`Invalid JSON at ${filePath}:${lineNumber + 1}`);
        }
    }

    return events;
}

function sortEventsNewestFirst(events) {
    return [...events].sort((left, right) => {
        const leftTime = Date.parse(left.timestamp || '') || 0;
        const rightTime = Date.parse(right.timestamp || '') || 0;
        return rightTime - leftTime;
    });
}

function countBy(items, selector) {
    const counts = new Map();

    for (const item of items) {
        const key = selector(item);
        counts.set(key, (counts.get(key) || 0) + 1);
    }

    return [...counts.entries()]
        .sort((left, right) => {
            if (right[1] !== left[1]) {
                return right[1] - left[1];
            }

            return String(left[0]).localeCompare(String(right[0]));
        })
        .map(([key, count]) => ({ key, count }));
}

function buildReport(events, options) {
    const filteredEvents = events.filter((event) => {
        if (options.ip && event.ip !== options.ip) {
            return false;
        }

        if (options.type && event.type !== options.type) {
            return false;
        }

        return true;
    });

    const sortedEvents = sortEventsNewestFirst(filteredEvents);
    const typeCounts = countBy(filteredEvents, (event) => event.type || 'unknown');
    const ipCounts = countBy(filteredEvents, (event) => event.ip || 'unknown');

    return {
        summary: {
            file: options.file,
            totalEvents: filteredEvents.length,
            uniqueIps: new Set(filteredEvents.map((event) => event.ip || 'unknown')).size,
            filters: {
                ip: options.ip,
                type: options.type,
            },
            typeCounts,
            topIps: ipCounts.slice(0, 5),
        },
        recentEvents: sortedEvents.slice(0, options.limit),
    };
}

function formatTextReport(report) {
    const lines = [];

    lines.push('Security Events Report');
    lines.push(`File: ${report.summary.file}`);
    lines.push(`Total events: ${report.summary.totalEvents}`);
    lines.push(`Unique IPs: ${report.summary.uniqueIps}`);

    if (report.summary.filters.ip || report.summary.filters.type) {
        lines.push('Filters:');
        if (report.summary.filters.ip) {
            lines.push(`  IP: ${report.summary.filters.ip}`);
        }
        if (report.summary.filters.type) {
            lines.push(`  Type: ${report.summary.filters.type}`);
        }
    }

    lines.push('');
    lines.push('Event types:');
    if (report.summary.typeCounts.length === 0) {
        lines.push('  (no matching events)');
    } else {
        for (const item of report.summary.typeCounts) {
            lines.push(`  ${item.key}: ${item.count}`);
        }
    }

    lines.push('');
    lines.push('Top IPs:');
    if (report.summary.topIps.length === 0) {
        lines.push('  (no matching events)');
    } else {
        for (const item of report.summary.topIps) {
            lines.push(`  ${item.key}: ${item.count}`);
        }
    }

    lines.push('');
    lines.push('Recent events:');
    if (report.recentEvents.length === 0) {
        lines.push('  (no matching events)');
    } else {
        for (const event of report.recentEvents) {
            lines.push(
                `  ${event.timestamp || 'unknown-time'} | ${event.ip || 'unknown-ip'} | ${event.type || 'unknown-type'} | ${event.method || '-'} ${event.path || event.url || '-'} | ${event.reason || 'unknown-reason'}`
            );
        }
    }

    return lines.join('\n');
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
        printUsage();
        return;
    }

    const events = await readJsonLines(options.file);
    const report = buildReport(events, options);

    if (options.json) {
        process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
        return;
    }

    process.stdout.write(`${formatTextReport(report)}\n`);
}

main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
});
