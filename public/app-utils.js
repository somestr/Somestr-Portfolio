(function attachAppUtils(globalScope) {
    'use strict';

    const THEME_OPTIONS = Object.freeze([
        { name: 'kali', icon: '🔵', label: 'Kali Linux' },
        { name: 'green', icon: '🟢', label: 'Hacker Green' },
        { name: 'red', icon: '🔴', label: 'Offensive Red' },
    ]);

    const THEME_MAP = new Map(THEME_OPTIONS.map((theme) => [theme.name, theme]));
    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function getThemeConfig(themeName) {
        return THEME_MAP.get(themeName) || THEME_MAP.get('kali');
    }

    function isSupportedThemeName(themeName) {
        return THEME_MAP.has(themeName);
    }

    function getStoredThemeName(storage = globalScope.localStorage) {
        const savedTheme = storage?.getItem?.('sec_theme') || '';
        return THEME_MAP.has(savedTheme) ? savedTheme : 'kali';
    }

    function applySiteTheme(themeName, options = {}) {
        const theme = getThemeConfig(themeName);
        const documentRef = options.document || globalScope.document || null;
        const storage = options.storage || globalScope.localStorage || null;
        const iconElement = options.iconElement
            || documentRef?.getElementById?.('theme-icon')
            || null;

        if (documentRef?.body?.dataset) {
            if (theme.name === 'kali') {
                delete documentRef.body.dataset.theme;
            } else {
                documentRef.body.dataset.theme = theme.name;
            }
        }

        if (iconElement) {
            iconElement.textContent = theme.icon;
        }

        storage?.setItem?.('sec_theme', theme.name);

        return theme;
    }

    function formatUptimeSeconds(totalSeconds) {
        const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }

    function isValidEmail(value) {
        return EMAIL_PATTERN.test(String(value || '').trim());
    }

    function getGitHubPagesBasePath(locationRef = globalScope.location) {
        const hostname = String(locationRef?.hostname || '');
        const pathname = String(locationRef?.pathname || '/');

        if (!/\.github\.io$/i.test(hostname)) {
            return '';
        }

        const firstSegment = pathname.split('/').filter(Boolean)[0] || '';
        if (!firstSegment || ['cli', 'entry', 'gui'].includes(firstSegment)) {
            return '';
        }

        return `/${firstSegment}`;
    }

    function getRoutedPathname(pathname = globalScope.location?.pathname || '/', locationRef = globalScope.location) {
        const basePath = getGitHubPagesBasePath(locationRef);
        const safePathname = String(pathname || '/');

        if (basePath && (safePathname === basePath || safePathname.startsWith(basePath + '/'))) {
            return safePathname.slice(basePath.length) || '/';
        }

        return safePathname;
    }

    function getModePath(mode, locationRef = globalScope.location) {
        const route = mode === 'cli' || mode === 'entry' ? mode : 'gui';
        return `${getGitHubPagesBasePath(locationRef)}/${route}`;
    }

    function getHomePath(locationRef = globalScope.location) {
        const basePath = getGitHubPagesBasePath(locationRef);
        return basePath ? `${basePath}/` : '/';
    }

    function scrollElementToBottom(element) {
        if (!element) {
            return;
        }

        element.scrollTop = element.scrollHeight;
    }

    function clearElementContent(element) {
        if (!element) {
            return;
        }

        if (typeof element.replaceChildren === 'function') {
            element.replaceChildren();
            return;
        }

        element.textContent = '';
    }

    function sequencesEqual(left, right) {
        if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
            return false;
        }

        for (let index = 0; index < left.length; index += 1) {
            if (left[index] !== right[index]) {
                return false;
            }
        }

        return true;
    }

    const exportsObject = {
        THEME_OPTIONS,
        applySiteTheme,
        clearElementContent,
        formatUptimeSeconds,
        getGitHubPagesBasePath,
        getHomePath,
        getModePath,
        getRoutedPathname,
        getStoredThemeName,
        isSupportedThemeName,
        isValidEmail,
        scrollElementToBottom,
        sequencesEqual,
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = exportsObject;
    }

    globalScope.OBAUtils = exportsObject;
})(typeof globalThis !== 'undefined' ? globalThis : this);
