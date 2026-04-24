(function initToastFeature(globalScope) {
    'use strict';

    function showToast(message, type = 'info') {
        const container = globalScope.document.getElementById('toast-container');
        if (!container) return;

        const toast = globalScope.document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        globalScope.setTimeout(() => toast.remove(), 3500);
    }

    function initToastSystem() {
        globalScope.showToast = showToast;
    }

    globalScope.initToastSystem = initToastSystem;
})(typeof globalThis !== 'undefined' ? globalThis : this);
