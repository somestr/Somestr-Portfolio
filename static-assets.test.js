'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const PUBLIC_DIR = path.join(__dirname, 'public');
const INDEX_HTML = path.join(PUBLIC_DIR, 'index.html');
const NOT_FOUND_HTML = path.join(PUBLIC_DIR, '404.html');
const NOT_FOUND_REDIRECT_JS = path.join(PUBLIC_DIR, 'not-found-redirect.js');
const ROUTE_REDIRECT_JS = path.join(PUBLIC_DIR, 'route-redirect.js');
const ROUTE_REDIRECTS = ['cli', 'entry', 'gui'];
const LOCAL_ASSET_PATTERN = /\.(?:css|js|png|jpg|jpeg|gif|svg|webp|ico)(?:\?|$)/i;

function readIndexHtml() {
    return fs.readFileSync(INDEX_HTML, 'utf8');
}

function listPublicHtmlFiles(dir = PUBLIC_DIR) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const htmlFiles = [];

    for (const entry of entries) {
        const entryPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            htmlFiles.push(...listPublicHtmlFiles(entryPath));
        } else if (entry.name.endsWith('.html')) {
            htmlFiles.push(entryPath);
        }
    }

    return htmlFiles;
}

function getLocalAssetRefs(html, htmlPath = INDEX_HTML) {
    return [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)]
        .map((match) => match[1])
        .filter((ref) => LOCAL_ASSET_PATTERN.test(ref))
        .filter((ref) => !ref.startsWith('data:') && !/^https?:\/\//i.test(ref))
        .map((ref) => {
            const assetPath = path
                .relative(PUBLIC_DIR, path.resolve(path.dirname(htmlPath), ref.split('?')[0]))
                .replace(/\\/g, '/');

            return { ref, assetPath };
        });
}

function getAssetRefs(html) {
    return getLocalAssetRefs(html).map(({ ref }) => ref);
}

function getPublicUrlAssetRefs(html) {
    const publicBase = 'https://somestr.github.io/Somestr-Portfolio/';
    return [...html.matchAll(/\bcontent="([^"]+)"/g)]
        .map((match) => match[1])
        .filter((ref) => ref.startsWith(publicBase) && LOCAL_ASSET_PATTERN.test(ref))
        .map((ref) => ref.slice(publicBase.length));
}

test('public HTML references existing local assets', () => {
    const htmlFiles = listPublicHtmlFiles();
    const refs = htmlFiles.flatMap((htmlPath) => getLocalAssetRefs(fs.readFileSync(htmlPath, 'utf8'), htmlPath));

    assert.ok(refs.length > 0, 'expected public/index.html to reference local assets');

    for (const { ref, assetPath } of refs) {
        assert.ok(
            fs.existsSync(path.join(PUBLIC_DIR, assetPath)),
            `missing asset referenced by public HTML: ${ref}`,
        );
    }
});

test('public CSS and JavaScript assets use cache-busting query strings', () => {
    const refs = listPublicHtmlFiles()
        .flatMap((htmlPath) => getLocalAssetRefs(fs.readFileSync(htmlPath, 'utf8'), htmlPath))
        .map(({ ref }) => ref)
        .filter((ref) => /\.(?:css|js)(?:\?|$)/i.test(ref));

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

test('public HTML avoids inline scripts for CSP compatibility', () => {
    for (const htmlPath of listPublicHtmlFiles()) {
        const html = fs.readFileSync(htmlPath, 'utf8');

        assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/i, `inline script found in ${htmlPath}`);
    }
});

test('GitHub Pages 404 fallback preserves client-side mode routes', () => {
    const notFoundHtml = fs.readFileSync(NOT_FOUND_HTML, 'utf8');
    const notFoundRedirectJs = fs.readFileSync(NOT_FOUND_REDIRECT_JS, 'utf8');

    assert.match(notFoundHtml, /src="not-found-redirect\.js\?v=1"/);
    assert.match(notFoundRedirectJs, /portfolio_mode/);
    assert.match(notFoundRedirectJs, /route === '\/cli'/);
    assert.match(notFoundRedirectJs, /route === '\/gui'/);
});

test('GitHub Pages mode routes have static redirect entries', () => {
    const routeRedirectJs = fs.readFileSync(ROUTE_REDIRECT_JS, 'utf8');

    assert.match(routeRedirectJs, /sessionStorage\.setItem\('portfolio_mode'/);
    assert.match(routeRedirectJs, /sessionStorage\.removeItem\('intro_done'\)/);

    for (const route of ROUTE_REDIRECTS) {
        const routeHtmlPath = path.join(PUBLIC_DIR, route, 'index.html');
        const routeHtml = fs.readFileSync(routeHtmlPath, 'utf8');

        assert.match(routeHtml, new RegExp(`data-route-mode="${route}"`));
        assert.match(routeHtml, /src="\.\.\/route-redirect\.js\?v=1"/);
    }
});
