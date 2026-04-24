(function initCommandPaletteFeature(globalScope) {
    'use strict';

    const AppUtils = globalScope.OBAUtils || {};
    const clearElementContent = AppUtils.clearElementContent || ((element) => {
        if (!element) return;
        element.textContent = '';
    });

    function initCommandPalette() {
        const overlay = globalScope.document.getElementById('cmd-palette-overlay');
        const input = globalScope.document.getElementById('cmd-palette-input');
        const results = globalScope.document.getElementById('cmd-palette-results');
        if (!overlay || !input || !results) return;

        const commands = [
            { icon: '🏠', label: 'Home', action: () => scrollToSection('hero') },
            { icon: '👤', label: 'About', action: () => scrollToSection('about') },
            { icon: '🔗', label: 'Experience', action: () => scrollToSection('experience') },
            { icon: '⚡', label: 'Skills', action: () => scrollToSection('skills') },
            { icon: '💙', label: 'Projects', action: () => scrollToSection('projects') },
            { icon: '📬', label: 'Contact', action: () => scrollToSection('contact') },
            { icon: '📝', label: 'Terminal', action: () => scrollToSection('terminal') },
            { icon: '🎨', label: 'Switch Theme', action: () => globalScope.document.getElementById('theme-toggle')?.click() },
            {
                icon: '🌐',
                label: 'Switch Language',
                action: () => {
                    const curr = globalScope.localStorage.getItem('lang') || globalScope.localStorage.getItem('sec_lang') || 'tr';
                    const cycle = { tr: 'en', en: 'ko', ko: 'tr' };
                    if (typeof globalScope.switchLang === 'function') {
                        globalScope.switchLang(cycle[curr] || 'en');
                    }
                },
            },
            { icon: '🖨', label: 'Back to Top', action: () => globalScope.scrollTo({ top: 0, behavior: 'smooth' }) },
        ];

        let activeIdx = 0;
        let filtered = [...commands];

        function scrollToSection(id) {
            const el = globalScope.document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        }

        function render() {
            clearElementContent(results);
            if (activeIdx >= filtered.length) {
                activeIdx = 0;
            }
            filtered.forEach((cmd, i) => {
                const li = globalScope.document.createElement('li');
                if (i === activeIdx) li.classList.add('active');
                const iconSpan = globalScope.document.createElement('span');
                iconSpan.className = 'cmd-icon';
                iconSpan.textContent = cmd.icon;
                const labelSpan = globalScope.document.createElement('span');
                labelSpan.className = 'cmd-label';
                labelSpan.textContent = cmd.label;
                li.appendChild(iconSpan);
                li.appendChild(labelSpan);
                li.addEventListener('click', () => {
                    closePalette();
                    cmd.action();
                });
                results.appendChild(li);
            });
        }

        function openPalette() {
            overlay.classList.add('active');
            input.value = '';
            activeIdx = 0;
            filtered = [...commands];
            render();
            setTimeout(() => input.focus(), 100);
        }

        function closePalette() {
            overlay.classList.remove('active');
            input.value = '';
        }

        globalScope.document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (overlay.classList.contains('active')) {
                    closePalette();
                } else {
                    openPalette();
                }
            }
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                closePalette();
            }
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closePalette();
            }
        });

        input.addEventListener('input', () => {
            const query = input.value.toLowerCase();
            filtered = commands.filter((cmd) => cmd.label.toLowerCase().includes(query));
            activeIdx = 0;
            render();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (filtered.length === 0) return;
                activeIdx = (activeIdx + 1) % filtered.length;
                render();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (filtered.length === 0) return;
                activeIdx = (activeIdx - 1 + filtered.length) % filtered.length;
                render();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filtered[activeIdx]) {
                    closePalette();
                    filtered[activeIdx].action();
                }
            }
        });
    }

    globalScope.initCommandPalette = initCommandPalette;
})(typeof globalThis !== 'undefined' ? globalThis : this);
