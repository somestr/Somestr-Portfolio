const test = require('node:test');
const assert = require('node:assert/strict');

const {
    applySiteTheme,
    formatUptimeSeconds,
    getGitHubPagesBasePath,
    getHomePath,
    getModePath,
    getRoutedPathname,
    getStoredThemeName,
    isSupportedThemeName,
    isValidEmail,
    sequencesEqual,
} = require('./public/app-utils.js');

function createThemeHarness() {
    const themeIcon = { textContent: '' };
    const dataset = {};
    const storageValues = new Map();

    return {
        document: {
            body: { dataset },
            getElementById(id) {
                return id === 'theme-icon' ? themeIcon : null;
            },
        },
        storage: {
            getItem(key) {
                return storageValues.has(key) ? storageValues.get(key) : null;
            },
            setItem(key, value) {
                storageValues.set(key, String(value));
            },
        },
        dataset,
        themeIcon,
        storageValues,
    };
}

test('applySiteTheme persists non-default themes and updates the icon', () => {
    const harness = createThemeHarness();

    const theme = applySiteTheme('green', {
        document: harness.document,
        storage: harness.storage,
    });

    assert.equal(theme.name, 'green');
    assert.equal(harness.dataset.theme, 'green');
    assert.equal(harness.themeIcon.textContent, '🟢');
    assert.equal(harness.storageValues.get('sec_theme'), 'green');
});

test('applySiteTheme clears dataset state for the default kali theme', () => {
    const harness = createThemeHarness();
    harness.dataset.theme = 'red';

    const theme = applySiteTheme('kali', {
        document: harness.document,
        storage: harness.storage,
    });

    assert.equal(theme.name, 'kali');
    assert.equal('theme' in harness.dataset, false);
    assert.equal(harness.themeIcon.textContent, '🔵');
    assert.equal(harness.storageValues.get('sec_theme'), 'kali');
});

test('getStoredThemeName falls back to kali for unsupported values', () => {
    const harness = createThemeHarness();
    harness.storageValues.set('sec_theme', 'unknown');

    assert.equal(getStoredThemeName(harness.storage), 'kali');
});

test('theme and email helpers validate supported values consistently', () => {
    assert.equal(isSupportedThemeName('kali'), true);
    assert.equal(isSupportedThemeName('green'), true);
    assert.equal(isSupportedThemeName('blue'), false);
    assert.equal(isValidEmail('test@example.com'), true);
    assert.equal(isValidEmail(' spaced@example.com '), true);
    assert.equal(isValidEmail('bad-email'), false);
});

test('formatUptimeSeconds and sequencesEqual handle common utility cases', () => {
    assert.equal(formatUptimeSeconds(3661.9), '1h 1m 1s');
    assert.equal(formatUptimeSeconds(59), '0h 0m 59s');
    assert.equal(sequencesEqual(['ArrowUp', 'ArrowDown'], ['ArrowUp', 'ArrowDown']), true);
    assert.equal(sequencesEqual(['ArrowUp'], ['ArrowDown']), false);
    assert.equal(sequencesEqual(['ArrowUp'], ['ArrowUp', 'ArrowDown']), false);
});

test('GitHub Pages route helpers preserve project base paths', () => {
    const pagesLocation = {
        hostname: 'somestr.github.io',
        pathname: '/Somestr-Portfolio/gui',
    };
    const localLocation = {
        hostname: 'localhost',
        pathname: '/gui',
    };

    assert.equal(getGitHubPagesBasePath(pagesLocation), '/Somestr-Portfolio');
    assert.equal(getRoutedPathname('/Somestr-Portfolio/cli', pagesLocation), '/cli');
    assert.equal(getHomePath(pagesLocation), '/Somestr-Portfolio/');
    assert.equal(getModePath('gui', pagesLocation), '/Somestr-Portfolio/gui');
    assert.equal(getModePath('cli', pagesLocation), '/Somestr-Portfolio/cli');
    assert.equal(getGitHubPagesBasePath(localLocation), '');
    assert.equal(getHomePath(localLocation), '/');
    assert.equal(getRoutedPathname('/gui', localLocation), '/gui');
    assert.equal(getModePath('entry', localLocation), '/entry');
});
