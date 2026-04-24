'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const PUBLIC_DIR = path.join(__dirname, 'public');
const INDEX_HTML = path.join(PUBLIC_DIR, 'index.html');
const LOCAL_ASSET_PATTERN = /\.(?:css|js|png|jpg|jpeg|gif|svg|webp|ico)(?:\?|$)/i;

function readIndexHtml() {
    return fs.readFileSync(INDEX_HTML, 'utf8');
}

function getAssetRefs(html) {
    return [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)]
        .map((match) => match[1])
        .filter((ref) => LOCAL_ASSET_PATTERN.test(ref))
        .filter((ref) => !ref.startsWith('data:') && !/^https?:\/\//i.test(ref));
}

test('public index references existing local assets', () => {
    const refs = getAssetRefs(readIndexHtml());

    assert.ok(refs.length > 0, 'expected public/index.html to reference local assets');

    for (const ref of refs) {
        const assetPath = ref.split('?')[0];
        assert.ok(
            fs.existsSync(path.join(PUBLIC_DIR, assetPath)),
            `missing asset referenced by public/index.html: ${ref}`,
        );
    }
});

test('public CSS and JavaScript assets use cache-busting query strings', () => {
    const refs = getAssetRefs(readIndexHtml()).filter((ref) => /\.(?:css|js)(?:\?|$)/i.test(ref));

    for (const ref of refs) {
        assert.match(ref, /\?v=[\w.-]+$/, `missing cache-busting version query: ${ref}`);
    }
});
