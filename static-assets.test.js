'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const PUBLIC_DIR = path.join(__dirname, 'public');
const INDEX_HTML = path.join(PUBLIC_DIR, 'index.html');
const NOT_FOUND_HTML = path.join(PUBLIC_DIR, '404.html');
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

function getPublicUrlAssetRefs(html) {
    const publicBase = 'https://somestr.github.io/Somestr-Portfolio/';
    return [...html.matchAll(/\bcontent="([^"]+)"/g)]
        .map((match) => match[1])
        .filter((ref) => ref.startsWith(publicBase) && LOCAL_ASSET_PATTERN.test(ref))
        .map((ref) => ref.slice(publicBase.length));
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

test('public social image metadata references an existing asset', () => {
    const refs = getPublicUrlAssetRefs(readIndexHtml());

    assert.ok(refs.includes('og-image.svg'), 'expected Open Graph/Twitter image metadata');

    for (const ref of refs) {
        assert.ok(
            fs.existsSync(path.join(PUBLIC_DIR, ref)),
            `missing public URL asset referenced by metadata: ${ref}`,
        );
    }
});

test('public index does not expose placeholder links', () => {
    assert.doesNotMatch(readIndexHtml(), /\bhref="#"/, 'replace placeholder links with real links or disabled text');
});

test('GitHub Pages 404 fallback preserves client-side mode routes', () => {
    const notFoundHtml = fs.readFileSync(NOT_FOUND_HTML, 'utf8');

    assert.match(notFoundHtml, /portfolio_mode/);
    assert.match(notFoundHtml, /route === '\/cli'/);
    assert.match(notFoundHtml, /route === '\/gui'/);
});
