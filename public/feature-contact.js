(function initContactFeature(globalScope) {
    'use strict';

    const AppUtils = globalScope.OBAUtils || {};
    const isValidEmail = AppUtils.isValidEmail || ((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim()));

    const getTranslation = (typeof globalScope.getT === 'function')
        ? globalScope.getT
        : (key) => key;

    function isStaticHost() {
        const location = globalScope.location;
        const hostname = (location && location.hostname) || '';
        return !location
            || location.protocol === 'file:'
            || /\.github\.io$/i.test(hostname);
    }

    function initContactForm() {
        const form = globalScope.document.getElementById('contact-form');
        const status = globalScope.document.getElementById('form-status');
        const btn = globalScope.document.getElementById('form-submit');
        const nameInput = globalScope.document.getElementById('form-name');
        const emailInput = globalScope.document.getElementById('form-email');
        const messageInput = globalScope.document.getElementById('form-message');

        if (!form || !status || !btn || !nameInput || !emailInput || !messageInput) {
            return;
        }

        let hideStatusTimer = null;

        if (isStaticHost() || typeof globalScope.fetch !== 'function') {
            btn.disabled = true;
            btn.setAttribute('aria-disabled', 'true');
            showStatus('error', getTranslation('form_static'), { persist: true });
            return;
        }

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const message = messageInput.value.trim();

            if (!name || !email || !message || !isValidEmail(email)) {
                showStatus('error', getTranslation('form_err'));
                return;
            }

            btn.disabled = true;
            try {
                const response = await globalScope.fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message }),
                });
                const contentType = response.headers.get('content-type') || '';

                if (!contentType.includes('application/json')) {
                    showStatus('error', getTranslation('form_static'));
                    return;
                }

                const data = await response.json();

                if (response.ok && data.ok) {
                    showStatus('success', getTranslation('form_ok'));
                    form.reset();
                } else {
                    showStatus('error', data.error || getTranslation('form_err'));
                }
            } catch {
                showStatus('error', getTranslation('form_err'));
            } finally {
                btn.disabled = false;
            }
        });

        function showStatus(type, msg, options = {}) {
            if (hideStatusTimer) {
                clearTimeout(hideStatusTimer);
            }

            status.textContent = msg;
            status.className = 'form-status ' + type;
            status.style.display = 'block';
            if (options.persist) {
                hideStatusTimer = null;
                return;
            }
            hideStatusTimer = setTimeout(() => {
                status.style.display = 'none';
                hideStatusTimer = null;
            }, 5000);
        }
    }

    globalScope.initContactForm = initContactForm;
})(typeof globalThis !== 'undefined' ? globalThis : this);
