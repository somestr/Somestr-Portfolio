(function initThemeFeature(globalScope) {
    'use strict';

    const AppUtils = globalScope.OBAUtils || {};
    const THEME_OPTIONS = AppUtils.THEME_OPTIONS || [];
    const applySiteTheme = AppUtils.applySiteTheme || (() => ({ name: 'kali', icon: '👤' }));
    const getStoredThemeName = AppUtils.getStoredThemeName || (() => 'kali');

    function initThemeSwitcher() {
        const toggle = globalScope.document.getElementById('theme-toggle');
        if (!toggle || THEME_OPTIONS.length === 0) return;

        const themes = THEME_OPTIONS;
        let currentIdx = 0;

        const savedTheme = getStoredThemeName();
        if (savedTheme) {
            const idx = themes.findIndex((theme) => theme.name === savedTheme);
            if (idx > -1) {
                currentIdx = idx;
            }
        }

        function notifyThemeChange(themeLabel) {
            if (typeof globalScope.showToast === 'function') {
                globalScope.showToast(`Theme: ${themeLabel}`, 'info');
            }
        }

        function applyTheme(idx) {
            const theme = themes[idx];
            applySiteTheme(theme.name);
            notifyThemeChange(theme.label);
        }

        applyTheme(currentIdx);

        toggle.addEventListener('click', () => {
            currentIdx = (currentIdx + 1) % themes.length;
            applyTheme(currentIdx);
        });
    }

    globalScope.initThemeSwitcher = initThemeSwitcher;
})(typeof globalThis !== 'undefined' ? globalThis : this);

