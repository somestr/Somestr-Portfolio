'use strict';

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const EXCLUDED_DIRS = new Set(['.git', 'node_modules']);

function collectJavaScriptFiles(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        if (entry.isDirectory()) {
            if (!EXCLUDED_DIRS.has(entry.name)) {
                files.push(...collectJavaScriptFiles(path.join(directory, entry.name)));
            }
            continue;
        }

        if (entry.isFile() && entry.name.endsWith('.js')) {
            files.push(path.join(directory, entry.name));
        }
    }

    return files;
}

const files = collectJavaScriptFiles(ROOT_DIR).sort((left, right) => left.localeCompare(right));

for (const file of files) {
    const result = spawnSync(process.execPath, ['--check', file], {
        cwd: ROOT_DIR,
        encoding: 'utf8',
    });

    if (result.status !== 0) {
        process.stderr.write(result.stderr || result.stdout);
        process.exit(result.status || 1);
    }
}

console.log(`Checked ${files.length} JavaScript files.`);
