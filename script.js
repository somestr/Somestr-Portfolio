/* ============================================
   script.js — Animations, Matrix, Interactions
   ============================================ */

'use strict';

// ─── Matrix Rain ────────────────────────────────────────────────────────────
(function initMatrix() {
    const canvas  = document.getElementById('matrix-canvas');
    const ctx     = canvas.getContext('2d');
    const CHARS   = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ01アBAD0x</>{}[]$#@!%^&*';
    const FONT_SZ = 14;
    let cols, drops;

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        cols  = Math.floor(canvas.width / FONT_SZ);
        drops = Array(cols).fill(1);
    }

    function draw() {
        ctx.fillStyle = 'rgba(1,11,1,0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ff41';
        ctx.font      = FONT_SZ + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const char = CHARS[Math.floor(Math.random() * CHARS.length)];
            ctx.fillText(char, i * FONT_SZ, drops[i] * FONT_SZ);
            if (drops[i] * FONT_SZ > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }

    resize();
    window.addEventListener('resize', resize);
    setInterval(draw, 50);
})();


// ─── Typewriter Utility ──────────────────────────────────────────────────────
function typewrite(el, text, speed, callback) {
    let i = 0;
    el.textContent = '';
    function tick() {
        if (i < text.length) {
            el.textContent += text[i++];
            setTimeout(tick, speed + Math.random() * 30);
        } else if (callback) {
            setTimeout(callback, 300);
        }
    }
    tick();
}


// ─── Hero Terminal Sequence ──────────────────────────────────────────────────
function runHeroTerminal() {
    const cmd1    = document.getElementById('cmd1');
    const out1    = document.getElementById('output1');
    const line2   = document.getElementById('line2');
    const cmd2    = document.getElementById('cmd2');
    const out2    = document.getElementById('output2');
    const line3   = document.getElementById('line3');
    const cta     = document.getElementById('hero-cta');
    const bar     = document.getElementById('hero-progress');
    const pct     = document.getElementById('hero-pct');

    const TEXT1 = getT('terminal_cmd1');
    const TEXT2 = getT('terminal_cmd2');

    setTimeout(() => {
        typewrite(cmd1, TEXT1, 60, () => {
            out1.style.display = 'block';
            line2.style.display = 'flex';

            setTimeout(() => {
                typewrite(cmd2, TEXT2, 60, () => {
                    out2.style.display = 'block';
                    animateProgress(bar, pct, 0, 100, 1800, () => {
                        line3.style.display = 'flex';
                        cta.style.display = 'flex';
                        cta.classList.add('fade-in');
                        requestAnimationFrame(() => cta.classList.add('visible'));
                    });
                });
            }, 600);
        });
    }, 800);
}

function animateProgress(barEl, pctEl, from, to, duration, cb) {
    const start = performance.now();
    function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const val = Math.floor(from + (to - from) * progress);
        barEl.style.setProperty('--pct', val + '%');
        pctEl.textContent = val + '%';
        if (progress < 1) requestAnimationFrame(step);
        else if (cb) cb();
    }
    requestAnimationFrame(step);
}


// ─── Logo Typewriter ─────────────────────────────────────────────────────────
function runLogoType() {
    const el   = document.getElementById('logo-type');
    const text = 'SEC_PORT';
    typewrite(el, text, 100);
}


// ─── Smooth Nav Active State ─────────────────────────────────────────────────
function initNavActiveState() {
    const sections = document.querySelectorAll('section[id]');
    const links    = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                links.forEach(l => l.classList.remove('active'));
                const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
                if (active) active.classList.add('active');
            }
        });
    }, { threshold: 0.4 });

    sections.forEach(s => observer.observe(s));
}


// ─── Fade-In on Scroll ───────────────────────────────────────────────────────
function initFadeIn() {
    const targets = document.querySelectorAll(
        '.section-header, .terminal-card, .project-card, .skill-category, .stat-card, .hero-cta, .about-stats'
    );

    targets.forEach(el => el.classList.add('fade-in'));

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });

    targets.forEach(el => obs.observe(el));
}


// ─── Skill Bar Animation ─────────────────────────────────────────────────────
function initSkillBars() {
    const fills = document.querySelectorAll('.skill-fill');

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const w = e.target.getAttribute('data-width') + '%';
                e.target.style.width = w;
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.3 });

    fills.forEach(f => obs.observe(f));
}


// ─── Stat Counter Animation ──────────────────────────────────────────────────
function initStatCounters() {
    const nums = document.querySelectorAll('.stat-num[data-target]');

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const target = parseInt(e.target.getAttribute('data-target'), 10);
                countUp(e.target, target, 1500);
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.5 });

    nums.forEach(n => obs.observe(n));
}

function countUp(el, target, duration) {
    const start = performance.now();
    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.floor(progress * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
    }
    requestAnimationFrame(step);
}


// ─── Contact Form (Client-Side Only) ────────────────────────────────────────
function initContactForm() {
    const form   = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    const btn    = document.getElementById('form-submit');

    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();

        const name    = document.getElementById('form-name').value.trim();
        const email   = document.getElementById('form-email').value.trim();
        const message = document.getElementById('form-message').value.trim();

        // Basic validation
        if (!name || !email || !message) {
            showStatus('error', getT('form_err'));
            return;
        }

        // Email format check (simple)
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(email)) {
            showStatus('error', getT('form_err'));
            return;
        }

        // Simulate send (replace with real endpoint as needed)
        btn.disabled = true;
        setTimeout(() => {
            showStatus('success', getT('form_ok'));
            form.reset();
            btn.disabled = false;
        }, 800);
    });

    function showStatus(type, msg) {
        status.textContent = msg;
        status.className   = 'form-status ' + type;
        status.style.display = 'block';
        setTimeout(() => { status.style.display = 'none'; }, 5000);
    }
}


// ─── Glitch Effect on Logo Hover ────────────────────────────────────────────
function initGlitch() {
    const logo = document.querySelector('.nav-logo');
    if (!logo) return;

    logo.addEventListener('mouseenter', () => {
        logo.style.textShadow = '2px 0 #00ffff, -2px 0 #ff0040';
        setTimeout(() => logo.style.textShadow = '', 200);
    });
}


// ─── Keyboard Shortcut: G for GitHub (example Easter Egg) ───────────────────
function initKeyboardEasterEgg() {
    const sequence = [];
    const CODE     = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight'];

    document.addEventListener('keydown', e => {
        sequence.push(e.key);
        if (sequence.length > CODE.length) sequence.shift();
        if (JSON.stringify(sequence) === JSON.stringify(CODE)) {
            flashScreen();
        }
    });
}

function flashScreen() {
    const flash = document.createElement('div');
    flash.style.cssText = [
        'position:fixed','top:0','left:0','width:100%','height:100%',
        'background:rgba(0,255,65,0.15)','z-index:9999',
        'pointer-events:none','transition:opacity 0.5s'
    ].join(';');
    document.body.appendChild(flash);
    setTimeout(() => { flash.style.opacity = '0'; }, 100);
    setTimeout(() => flash.remove(), 600);

    const msg = document.createElement('div');
    msg.textContent = '// ACCESS GRANTED — KONAMI CODE DETECTED';
    msg.style.cssText = [
        'position:fixed','top:50%','left:50%',
        'transform:translate(-50%,-50%)',
        'color:#00ff41','font-family:monospace','font-size:1.2rem',
        'z-index:10000','text-shadow:0 0 20px #00ff41',
        'pointer-events:none','transition:opacity 0.5s'
    ].join(';');
    document.body.appendChild(msg);
    setTimeout(() => { msg.style.opacity = '0'; }, 2500);
    setTimeout(() => msg.remove(), 3000);
}


// ─── Mobile Nav Toggle ───────────────────────────────────────────────────────
function initMobileNav() {
    // Close nav links when a link clicked on mobile
    const links = document.querySelectorAll('.nav-link');
    links.forEach(l => {
        l.addEventListener('click', () => {
            // smooth scroll is handled by CSS scroll-behavior
        });
    });
}


// ─── Boot ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    runLogoType();
    runHeroTerminal();
    initNavActiveState();
    initFadeIn();
    initSkillBars();
    initStatCounters();
    initContactForm();
    initGlitch();
    initKeyboardEasterEgg();
    initMobileNav();
});
