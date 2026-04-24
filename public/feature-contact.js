(function initContactFeature(globalScope) {
    'use strict';

    const AppUtils = globalScope.OBAUtils || {};
    const isValidEmail = AppUtils.isValidEmail || ((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim()));

    const getTranslation = (typeof globalScope.getT === 'function')
        ? globalScope.getT
        : (key) => key;

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
                const data = await response.json();

                if (data.ok) {
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

        function showStatus(type, msg) {
            if (hideStatusTimer) {
                clearTimeout(hideStatusTimer);
            }

            status.textContent = msg;
            status.className = 'form-status ' + type;
            status.style.display = 'block';
            hideStatusTimer = setTimeout(() => {
                status.style.display = 'none';
                hideStatusTimer = null;
            }, 5000);
        }
    }

    globalScope.initContactForm = initContactForm;
})(typeof globalThis !== 'undefined' ? globalThis : this);

