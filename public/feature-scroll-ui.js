(function initScrollUiFeature(globalScope) {
    'use strict';

    function initBackToTop() {
        const btn = globalScope.document.getElementById('back-to-top');
        if (!btn) return;

        globalScope.addEventListener('scroll', () => {
            if (globalScope.scrollY > 500) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }, { passive: true });

        btn.addEventListener('click', () => {
            globalScope.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function initNavScroll() {
        const nav = globalScope.document.getElementById('main-nav');
        if (!nav) return;

        globalScope.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', globalScope.scrollY > 50);
        }, { passive: true });
    }

    function initScrollProgress() {
        const bar = globalScope.document.getElementById('scroll-progress');
        if (!bar) return;

        globalScope.addEventListener('scroll', () => {
            const scrollableHeight = globalScope.document.documentElement.scrollHeight - globalScope.innerHeight;
            const percentage = scrollableHeight > 0 ? (globalScope.scrollY / scrollableHeight) * 100 : 0;
            bar.style.width = percentage + '%';
        }, { passive: true });
    }

    globalScope.initBackToTop = initBackToTop;
    globalScope.initNavScroll = initNavScroll;
    globalScope.initScrollProgress = initScrollProgress;
})(typeof globalThis !== 'undefined' ? globalThis : this);
