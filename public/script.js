/* ============================================
   script.js â€” Animations, Matrix, Interactions
   v4.0 â€” Interactive terminal, theme switcher,
          command palette, radar chart, toasts,
          3D tilt, text decrypt, mouse-reactive
   ============================================ */

'use strict';

const AppUtils = window.OBAUtils || {};
const THEME_OPTIONS = AppUtils.THEME_OPTIONS || [];
const applySiteTheme = AppUtils.applySiteTheme || ((themeName) => ({ name: themeName, icon: '' }));
const clearElementContent = AppUtils.clearElementContent || ((element) => {
    if (element) {
        element.textContent = '';
    }
});
const formatUptimeSeconds = AppUtils.formatUptimeSeconds || ((totalSeconds) => {
    const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
});
const getStoredThemeName = AppUtils.getStoredThemeName || (() => 'kali');
const isSupportedThemeName = AppUtils.isSupportedThemeName || ((themeName) => ['kali', 'green', 'red'].includes(themeName));
const isValidEmail = AppUtils.isValidEmail || ((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim()));
const scrollElementToBottom = AppUtils.scrollElementToBottom || ((element) => {
    if (element) {
        element.scrollTop = element.scrollHeight;
    }
});
const sequencesEqual = AppUtils.sequencesEqual || ((left, right) => JSON.stringify(left) === JSON.stringify(right));

function syncModeUrl(mode) {
    const target = mode === 'cli' ? '/cli' : '/gui';
    if (window.location.pathname !== target) {
        window.history.replaceState(null, '', target);
    }
}

// â”€â”€â”€ Terminal Intro Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(function initIntroTerminal() {
    const overlay = document.getElementById('intro-overlay');
    const screen  = document.getElementById('intro-body');
    if (!overlay || !screen) return;

    // /entry route: always show intro (clear previous session)
    const path = window.location.pathname;
    const isEntry = path === '/entry';
    const isGuiRoute = path === '/gui';
    const isCliRoute = path === '/cli';
    if (isEntry) {
        sessionStorage.removeItem('intro_done');
        sessionStorage.removeItem('portfolio_mode');
        document.body.classList.remove('cli-mode');
        const oldFs = document.getElementById('fs-terminal');
        if (oldFs) oldFs.remove();
    }

    // Direct route support
    if (isGuiRoute || isCliRoute) {
        const forcedMode = isCliRoute ? 'cli' : 'gui';
        sessionStorage.setItem('intro_done', '1');
        sessionStorage.setItem('portfolio_mode', forcedMode);
        overlay.remove();

        if (forcedMode === 'cli') {
            document.body.classList.add('cli-mode');
            setTimeout(() => initFullscreenTerminal(), 100);
        } else {
            document.body.classList.remove('cli-mode');
            const oldFs = document.getElementById('fs-terminal');
            if (oldFs) oldFs.remove();
        }
        return;
    }

    if (sessionStorage.getItem('intro_done') && !isEntry) {
        overlay.remove();
        if (sessionStorage.getItem('portfolio_mode') === 'cli') {
            syncModeUrl('cli');
            document.body.classList.add('cli-mode');
            setTimeout(() => initFullscreenTerminal(), 100);
        } else {
            syncModeUrl('gui');
            document.body.classList.remove('cli-mode');
        }
        return;
    }

    const now = new Date();
    const lastLogin = now.toDateString() + ' ' + now.toTimeString().slice(0, 8) + ' from 10.10.14.1';

    // Step types:
    //   line     â†’ append HTML instantly
    //   blank    â†’ append empty line
    //   dots     â†’ animate password dots into a new line
    //   prompt   â†’ append the two-line kali prompt (â”Œâ”€â”€/â””â”€#)
    //   typecmd  â†’ typewriter text appended to last element
    const STEPS = [
        { t: 'line',    html: '<span class="k-dim">Kali GNU/Linux Rolling Release (kali-rolling)</span>', ms: 0 },
        { t: 'line',    html: '<span class="k-dim">Kernel 6.8.0-kali1-amd64 on an x86_64</span>', ms: 60 },
        { t: 'blank',   ms: 200 },
        { t: 'line',    html: 'oba-sec login: <span class="k-white">root</span>', ms: 500 },
        { t: 'dots',    prefix: 'Password: ', count: 8, ms: 350 },
        { t: 'blank',   ms: 150 },
        { t: 'line',    html: '<span class="k-dim">Linux oba-sec 6.8.0-kali1-amd64 #1 SMP PREEMPT_DYNAMIC</span>', ms: 50 },
        { t: 'line',    html: '<span class="k-dim">Last login: ' + lastLogin + '</span>', ms: 50 },
        { t: 'blank',   ms: 300 },
        { t: 'prompt',  dir: '~', ms: 0 },
        { t: 'typecmd', text: 'whoami', ms: 400 },
        { t: 'line',    html: 'root', ms: 250 },
        { t: 'blank',   ms: 100 },
        { t: 'prompt',  dir: '~', ms: 0 },
        { t: 'typecmd', text: 'uname -r', ms: 400 },
        { t: 'line',    html: '6.8.0-kali1-amd64', ms: 250 },
        { t: 'blank',   ms: 100 },
        { t: 'prompt',  dir: '~', ms: 0 },
        { t: 'typecmd', text: './portfolio.sh', ms: 500 },
        { t: 'line',    html: '<span class="k-blue">[*]</span> Initializing portfolio...', ms: 180 },
        { t: 'line',    html: '<span class="k-blue">[*]</span> Loading modules...', ms: 200 },
        { t: 'line',    html: '<span class="k-blue">[*]</span> All systems ready.', ms: 280 },
        { t: 'blank',   ms: 120 },
        { t: 'line',    html: '<span class="k-blue">â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”</span>', ms: 60 },
        { t: 'line',    html: '<span class="k-blue">â”‚</span>  Select interface mode:                          <span class="k-blue">â”‚</span>', ms: 60 },
        { t: 'line',    html: '<span class="k-blue">â”‚</span>                                                   <span class="k-blue">â”‚</span>', ms: 60 },
        { t: 'line',    html: '<span class="k-blue">â”‚</span>  <span class="k-white">[1]</span> <span class="k-blue">GUI Mode</span>    â€” Visual portfolio interface   <span class="k-blue">â”‚</span>', ms: 60 },
        { t: 'line',    html: '<span class="k-blue">â”‚</span>  <span class="k-white">[2]</span> <span class="k-blue">CLI Mode</span>    â€” Terminal-only access         <span class="k-blue">â”‚</span>', ms: 60 },
        { t: 'line',    html: '<span class="k-blue">â”‚</span>                                                   <span class="k-blue">â”‚</span>', ms: 60 },
        { t: 'line',    html: '<span class="k-blue">â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜</span>', ms: 60 },
        { t: 'blank',   ms: 100 },
        { t: 'prompt',  dir: '~', ms: 0 },
        { t: 'line',    html: '<span class="k-blue">select</span> <span class="k-dim">(1/2):</span> <span class="k-blink">â–‹</span>', ms: 0 },
    ];

    let canEnter = false;
    let selectedMode = null;

    function enterSite(mode) {
        if (!canEnter) return;
        canEnter = false;
        sessionStorage.setItem('intro_done', '1');
        const selected = mode || 'gui';
        sessionStorage.setItem('portfolio_mode', selected);
        syncModeUrl(selected);

        if (mode === 'cli') {
            // Show fullscreen terminal
            overlay.classList.add('hidden');
            setTimeout(() => {
                overlay.remove();
                document.body.classList.add('cli-mode');
                initFullscreenTerminal();
            }, 700);
        } else {
            overlay.classList.add('hidden');
            setTimeout(() => overlay.remove(), 700);
        }
    }

    function appendLine(html) {
        const p = document.createElement('p');
        p.innerHTML = html;
        screen.appendChild(p);
        screen.scrollTop = screen.scrollHeight;
        return p;
    }

    function run(idx) {
        if (idx >= STEPS.length) {
            canEnter = true;
            document.addEventListener('keydown', function h(e) {
                if (e.key === '1') {
                    document.removeEventListener('keydown', h);
                    // Show typed "1" then enter GUI mode
                    const lastP = screen.querySelector('p:last-child');
                    if (lastP) lastP.innerHTML = '<span class="k-blue">select</span> <span class="k-dim">(1/2):</span> <span class="k-white">1</span>';
                    setTimeout(() => enterSite('gui'), 400);
                } else if (e.key === '2') {
                    document.removeEventListener('keydown', h);
                    const lastP = screen.querySelector('p:last-child');
                    if (lastP) lastP.innerHTML = '<span class="k-blue">select</span> <span class="k-dim">(1/2):</span> <span class="k-white">2</span>';
                    setTimeout(() => enterSite('cli'), 400);
                }
            });
            return;
        }

        const s = STEPS[idx];
        const next = () => run(idx + 1);

        if (s.t === 'line') {
            setTimeout(() => { appendLine(s.html); next(); }, s.ms);

        } else if (s.t === 'blank') {
            setTimeout(() => { appendLine('&nbsp;'); next(); }, s.ms);

        } else if (s.t === 'dots') {
            // Animate password dots
            setTimeout(() => {
                const p = appendLine(s.prefix);
                let dots = '', d = 0;
                const iv = setInterval(() => {
                    dots += '\u2022';
                    p.innerHTML = s.prefix + '<span class="k-dim">' + dots + '</span>';
                    screen.scrollTop = screen.scrollHeight;
                    if (++d >= s.count) { clearInterval(iv); setTimeout(next, 120); }
                }, 90);
            }, s.ms);

        } else if (s.t === 'prompt') {
            appendLine('<span class="k-blue">\u250c\u2500\u2500(root@oba-sec)-[' + s.dir + ']</span>');
            const p = appendLine('<span class="k-blue">\u2514\u2500# </span>');
            // store for typecmd
            screen._lastPromptLine = p;
            setTimeout(next, s.ms);

        } else if (s.t === 'typecmd') {
            const p = screen._lastPromptLine;
            if (!p) { next(); return; }
            const base = p.innerHTML;
            setTimeout(() => {
                let i = 0;
                const iv = setInterval(() => {
                    i++;
                    p.innerHTML = base + s.text.substring(0, i);
                    screen.scrollTop = screen.scrollHeight;
                    if (i >= s.text.length) { clearInterval(iv); setTimeout(next, 180); }
                }, 55);
            }, s.ms);

        } else {
            next();
        }
    }

    setTimeout(() => run(0), 300);
})();


// â”€â”€â”€ Fullscreen CLI Terminal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initFullscreenTerminal() {
    // Prevent duplicate initialization â€” only one instance allowed
    if (document.getElementById('fs-terminal')) {
        document.getElementById('fs-term-input')?.focus();
        return;
    }
    const wrapper = document.createElement('div');
    wrapper.id = 'fs-terminal';
    wrapper.className = 'fs-terminal';
    wrapper.innerHTML = `
        <div class="fs-term-body" id="fs-term-body">
            <div class="fs-term-output" id="fs-term-output"></div>
            <div class="fs-term-input-line">
                <span class="prompt">root@oba-sec:~$</span>
                <input type="text" class="fs-term-input" id="fs-term-input" spellcheck="false" autocomplete="off" autofocus>
            </div>
        </div>
    `;
    document.body.appendChild(wrapper);

    // Use wrapper-scoped queries to avoid getElementById returning stale elements
    const input  = wrapper.querySelector('.fs-term-input');
    const output = wrapper.querySelector('.fs-term-output');
    const body   = wrapper.querySelector('.fs-term-body');
    const promptEl = wrapper.querySelector('.prompt');

    body.addEventListener('click', () => input.focus());
    setTimeout(() => input.focus(), 200);

    const history = [];
    let histIdx = -1;
    let cwd = '~';

    const FS_BANNER = `
  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•— â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—       â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•— â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—
 â–ˆâ–ˆâ•”â•â•â•â–ˆâ–ˆâ•—â–ˆâ–ˆâ•”â•â•â–ˆâ–ˆâ•—â–ˆâ–ˆâ•”â•â•â–ˆâ–ˆâ•—      â–ˆâ–ˆâ•”â•â•â•â•â•â–ˆâ–ˆâ•”â•â•â•â•â•â–ˆâ–ˆâ•”â•â•â•â•â•
 â–ˆâ–ˆâ•‘   â–ˆâ–ˆâ•‘â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•”â•â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•‘â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—  â–ˆâ–ˆâ•‘
 â–ˆâ–ˆâ•‘   â–ˆâ–ˆâ•‘â–ˆâ–ˆâ•”â•â•â–ˆâ–ˆâ•—â–ˆâ–ˆâ•”â•â•â–ˆâ–ˆâ•‘â•šâ•â•â•â•â•â•šâ•â•â•â•â–ˆâ–ˆâ•‘â–ˆâ–ˆâ•”â•â•â•  â–ˆâ–ˆâ•‘
 â•šâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•”â•â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•”â•â–ˆâ–ˆâ•‘  â–ˆâ–ˆâ•‘      â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•‘â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—â•šâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—
  â•šâ•â•â•â•â•â• â•šâ•â•â•â•â•â• â•šâ•â•  â•šâ•â•      â•šâ•â•â•â•â•â•â•â•šâ•â•â•â•â•â•â• â•šâ•â•â•â•â•â•`;

    // File system simulation
    const FILESYSTEM = {
        '~': {
            type: 'dir',
            children: ['about.txt', 'contact.json', 'experience/', 'education/', 'projects/', 'skills.txt', 'certs.txt', 'README.md']
        },
        '~/experience': {
            type: 'dir',
            children: ['01_barista.log', '02_team_leader.log', '03_cyber_intern.log', '04_tech_support.log']
        },
        '~/education': {
            type: 'dir',
            children: ['01_griffith_college.txt', '02_sdu_university.txt']
        },
        '~/projects': {
            type: 'dir',
            children: ['netsweep_scanner.sh', 'webcrawl_pro.py', 'cryptovault.cpp', 'malsandbox.docker', 'packetprowler.py', 'ctf_writeups.md']
        }
    };

    const FILES = {
        '~/README.md': [
            { text: '# Ã–mer Burak AkÃ§Ä±nar â€” IT & Cybersecurity Portfolio', cls: 'success' },
            { text: '', cls: '' },
            { text: '  Welcome to my terminal portfolio.', cls: '' },
            { text: '  Navigate my files to learn about me.', cls: '' },
            { text: '', cls: '' },
            { text: '  Type "help" to see available commands.', cls: 'info' },
            { text: '  Type "gui" to switch to visual mode.', cls: 'info' },
        ],
        '~/about.txt': [
            { text: 'â”Œâ”€ About â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”', cls: 'success' },
            { text: 'â”‚                                                               â”‚', cls: '' },
            { text: 'â”‚  Name     : Ã–mer Burak AkÃ§Ä±nar                               â”‚', cls: '' },
            { text: 'â”‚  Role     : IT & Cybersecurity Professional                   â”‚', cls: '' },
            { text: 'â”‚  Location : Dublin, Ireland                                   â”‚', cls: '' },
            { text: 'â”‚  Status   : Open to new opportunities                         â”‚', cls: 'info' },
            { text: 'â”‚                                                               â”‚', cls: '' },
            { text: 'â”œâ”€ Summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚', cls: 'success' },
            { text: 'â”‚                                                               â”‚', cls: '' },
            { text: 'â”‚  Analytical IT and cybersecurity professional with hands-on   â”‚', cls: '' },
            { text: 'â”‚  experience in troubleshooting, end-user support and          â”‚', cls: '' },
            { text: 'â”‚  incident response.                                           â”‚', cls: '' },
            { text: 'â”‚                                                               â”‚', cls: '' },
            { text: 'â”‚  Experienced in leading teams of 10+ staff in high-pressure   â”‚', cls: '' },
            { text: 'â”‚  environments while maintaining operational efficiency.        â”‚', cls: '' },
            { text: 'â”‚                                                               â”‚', cls: '' },
            { text: 'â”‚  Continuous learner committed to staying current with          â”‚', cls: '' },
            { text: 'â”‚  emerging cyber threats and IT operations.                     â”‚', cls: '' },
            { text: 'â”‚                                                               â”‚', cls: '' },
            { text: 'â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜', cls: 'success' },
        ],
        '~/contact.json': [
            { text: '  {', cls: '' },
            { text: '    "email"     : "omerburaka95@gmail.com",', cls: 'info' },
            { text: '    "github"    : "github.com/somestr",', cls: '' },
            { text: '    "linkedin"  : "linkedin.com/in/omerburaka",', cls: '' },
            { text: '    "tryhackme" : "tryhackme.com/p/somestr",', cls: 'success' },
            { text: '    "location"  : "Dublin, Ireland",', cls: '' },
            { text: '    "status"    : "Open to new opportunities"', cls: 'info' },
            { text: '  }', cls: '' },
        ],
        '~/skills.txt': [
            { text: '  â”Œâ”€ Systems & Networking â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”', cls: 'success' },
            { text: '  â”‚  [â– â– â– â– â– â– â– â– â– â–‘]  90%  Windows                   â”‚', cls: '' },
            { text: '  â”‚  [â– â– â– â– â– â– â– â– â–‘â–‘]  85%  Linux / Kali Linux        â”‚', cls: '' },
            { text: '  â”‚  [â– â– â– â– â– â– â– â–‘â–‘â–‘]  75%  Active Directory          â”‚', cls: '' },
            { text: '  â”‚  [â– â– â– â– â– â– â– â– â–‘â–‘]  80%  Networking (DNS/DHCP/VPN) â”‚', cls: '' },
            { text: '  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜', cls: 'success' },
            { text: '', cls: '' },
            { text: '  â”Œâ”€ Cybersecurity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”', cls: 'success' },
            { text: '  â”‚  [â– â– â– â– â– â– â– â– â–‘â–‘]  80%  Incident Response         â”‚', cls: '' },
            { text: '  â”‚  [â– â– â– â– â– â– â– â–‘â–‘â–‘]  75%  Threat Detection          â”‚', cls: '' },
            { text: '  â”‚  [â– â– â– â– â– â– â– â–‘â–‘â–‘]  78%  Vulnerability Assessment  â”‚', cls: '' },
            { text: '  â”‚  [â– â– â– â– â– â– â– â– â– â–‘]  92%  IT Support & Troubleshoot â”‚', cls: '' },
            { text: '  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜', cls: 'success' },
            { text: '', cls: '' },
            { text: '  â”Œâ”€ Tools & Technologies â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”', cls: 'success' },
            { text: '  â”‚  Windows Â· Linux Â· Kali Linux Â· Active Dir     â”‚', cls: 'info' },
            { text: '  â”‚  Wireshark Â· Nmap Â· Metasploit Â· Burp Suite    â”‚', cls: 'info' },
            { text: '  â”‚  Microsoft 365 Â· DNS/DHCP Â· VPN Â· Docker       â”‚', cls: 'info' },
            { text: '  â”‚  PowerShell Â· Bash Â· Git Â· Python              â”‚', cls: 'info' },
            { text: '  â”‚  SIEM Â· Splunk                                 â”‚', cls: 'info' },
            { text: '  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜', cls: 'success' },
        ],
        '~/certs.txt': [
            { text: '  â”Œâ”€ Certifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”', cls: 'success' },
            { text: '  â”‚  [âœ”] CompTIA A+                                â”‚', cls: '' },
            { text: '  â”‚  [âœ”] Cisco Cybersecurity Essentials            â”‚', cls: '' },
            { text: '  â”‚  [âœ”] CyberTakeOff Programme                   â”‚', cls: '' },
            { text: '  â”‚  [â³] CompTIA Security+ (in progress)          â”‚', cls: 'info' },
            { text: '  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜', cls: 'success' },
        ],
        '~/experience/01_barista.log': [
            { text: '  â”Œâ”€ Barista â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”', cls: 'success' },
            { text: '  â”‚  Period  : Jun 2025 â€” Present                  â”‚', cls: '' },
            { text: '  â”‚  Company : Starbucks â€” Dublin, Ireland         â”‚', cls: '' },
            { text: '  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤', cls: 'success' },
            { text: '  â”‚  Delivering efficient service in a high-volume â”‚', cls: '' },
            { text: '  â”‚  environment serving 100+ customers per shift. â”‚', cls: '' },
            { text: '  â”‚  Supporting daily ops, cash handling and team  â”‚', cls: '' },
            { text: '  â”‚  coordination.                                 â”‚', cls: '' },
            { text: '  â”œâ”€ Tags â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤', cls: 'success' },
            { text: '  â”‚  #CustomerService  #Operations  #Teamwork     â”‚', cls: 'info' },
            { text: '  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜', cls: 'success' },
        ],
        '~/experience/02_team_leader.log': [
            { text: '  â”Œâ”€ Team Leader â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”', cls: 'success' },
            { text: '  â”‚  Period  : May 2023 â€” Apr 2025                 â”‚', cls: '' },
            { text: '  â”‚  Company : Superdrug â€” Dublin, Ireland         â”‚', cls: '' },
            { text: '  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤', cls: 'success' },
            { text: '  â”‚  Led a team of 10+ staff, acted as duty        â”‚', cls: '' },
            { text: '  â”‚  manager during absences. Oversaw scheduling,  â”‚', cls: '' },
            { text: '  â”‚  delegation, inventory control, cash mgmt and  â”‚', cls: '' },
            { text: '  â”‚  operational compliance.                       â”‚', cls: '' },
            { text: '  â”œâ”€ Tags â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤', cls: 'success' },
            { text: '  â”‚  #TeamLeadership  #DutyManager  #Operations   â”‚', cls: 'info' },
            { text: '  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜', cls: 'success' },
        ],
        '~/experience/03_cyber_intern.log': [
            { text: '  â”Œâ”€ Cybersecurity Intern â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”', cls: 'success' },
            { text: '  â”‚  Period  : Sep 2021 â€” Feb 2022                 â”‚', cls: '' },
            { text: '  â”‚  Company : Isparta University â€” Turkey         â”‚', cls: '' },
            { text: '  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤', cls: 'success' },
            { text: '  â”‚  Assisted with incident response and           â”‚', cls: '' },
            { text: '  â”‚  vulnerability assessments. Co-organized       â”‚', cls: '' },
            { text: '  â”‚  phishing awareness sessions that improved     â”‚', cls: '' },
            { text: '  â”‚  staff detection rates by 35%.                 â”‚', cls: '' },
            { text: '  â”œâ”€ Tags â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤', cls: 'success' },
            { text: '  â”‚  #IncidentResponse  #VulnAssess  #Phishing    â”‚', cls: 'info' },
            { text: '  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜', cls: 'success' },
        ],
        '~/experience/04_tech_support.log': [
            { text: '  â”Œâ”€ Technical Support â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”', cls: 'success' },
            { text: '  â”‚  Period  : Jan 2017 â€” Feb 2018                 â”‚', cls: '' },
            { text: '  â”‚  Company : Maxi Computer Systems â€” Turkey      â”‚', cls: '' },
            { text: '  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤', cls: 'success' },
            { text: '  â”‚  Installed, configured and maintained client    â”‚', cls: '' },
            { text: '  â”‚  systems. Diagnosed and resolved technical      â”‚', cls: '' },
            { text: '  â”‚  issues, provided end-user support, assisted   â”‚', cls: '' },
            { text: '  â”‚  with network setups and basic cybersecurity.  â”‚', cls: '' },
            { text: '  â”œâ”€ Tags â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤', cls: 'success' },
            { text: '  â”‚  #Hardware  #Networking  #EndUserSupport       â”‚', cls: 'info' },
            { text: '  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜', cls: 'success' },
        ],
        '~/education/01_griffith_college.txt': [
            { text: '  â”Œâ”€ Higher Diploma in Computing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”', cls: 'success' },
            { text: '  â”‚  Year   : 2025                                 â”‚', cls: '' },
            { text: '  â”‚  School : Griffith College â€” Dublin, Ireland   â”‚', cls: '' },
            { text: '  â”‚  Desc   : Higher Diploma in Computing          â”‚', cls: '' },
            { text: '  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜', cls: 'success' },
        ],
        '~/education/02_sdu_university.txt': [
            { text: '  â”Œâ”€ B.Sc. Mechatronic Engineering â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”', cls: 'success' },
            { text: '  â”‚  Year   : Turkey                               â”‚', cls: '' },
            { text: '  â”‚  School : SÃ¼leyman Demirel University â€” Turkey â”‚', cls: '' },
            { text: '  â”‚  Desc   : B.Sc. in Mechatronic Engineering     â”‚', cls: '' },
            { text: '  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜', cls: 'success' },
        ],
        '~/projects/netsweep_scanner.sh': [
            { text: '  â”Œâ”€ NetSweep Scanner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”', cls: 'success' },
            { text: '  â”‚  Type : Offense                                â”‚', cls: '' },
            { text: '  â”‚  Tech : Python, Nmap, CVE-DB                   â”‚', cls: 'info' },
            { text: '  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤', cls: 'success' },
            { text: '  â”‚  Custom-built network scanner and vulnerability â”‚', cls: '' },
            { text: '  â”‚  detection tool. Analyzes Nmap outputs for     â”‚', cls: '' },
            { text: '  â”‚  automatic CVE matching.                       â”‚', cls: '' },
            { text: '  â”œâ”€ Findings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤', cls: 'success' },
            { text: '  â”‚  CRITICAL: 3   HIGH: 12                        â”‚', cls: 'error' },
            { text: '  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜', cls: 'success' },
        ],
        '~/projects/webcrawl_pro.py': [
            { text: '  â”Œâ”€ WebCrawl Pro â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”', cls: 'success' },
            { text: '  â”‚  Type : Offense                                â”‚', cls: '' },
            { text: '  â”‚  Tech : Python, Selenium, OWASP                â”‚', cls: 'info' },
            { text: '  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤', cls: 'success' },
            { text: '  â”‚  Web application security scanner. Detects     â”‚', cls: '' },
            { text: '  â”‚  XSS, SQL injection, CSRF and IDOR vulns.     â”‚', cls: '' },
            { text: '  â”‚  Full OWASP Top 10 coverage.                   â”‚', cls: '' },
            { text: '  â”œâ”€ Findings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤', cls: 'success' },
            { text: '  â”‚  CRITICAL: 7   HIGH: 24                        â”‚', cls: 'error' },
            { text: '  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜', cls: 'success' },
        ],
        '~/projects/cryptovault.cpp': [
            { text: '  â”Œâ”€ CryptoVault â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”', cls: 'success' },
            { text: '  â”‚  Type : Tool                                   â”‚', cls: '' },
            { text: '  â”‚  Tech : C++, OpenSSL, Crypto                   â”‚', cls: 'info' },
            { text: '  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤', cls: 'success' },
            { text: '  â”‚  Cryptographic algorithm analysis platform.    â”‚', cls: '' },
            { text: '  â”‚  Detects weak implementations and recommends  â”‚', cls: '' },
            { text: '  â”‚  modern alternatives.                          â”‚', cls: '' },
            { text: '  â”œâ”€ Findings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤', cls: 'success' },
            { text: '  â”‚  HIGH: 8   MEDIUM: 31                          â”‚', cls: 'warn' },
            { text: '  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜', cls: 'success' },
        ],
        '~/projects/malsandbox.docker': [
            { text: '  â”Œâ”€ MalSandbox â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”', cls: 'success' },
            { text: '  â”‚  Type : Defense                                â”‚', cls: '' },
            { text: '  â”‚  Tech : Docker, Python, YARA                   â”‚', cls: 'info' },
            { text: '  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤', cls: 'success' },
            { text: '  â”‚  Malware analysis platform in isolated sandbox â”‚', cls: '' },
            { text: '  â”‚  environment. Behavior-based detection and     â”‚', cls: '' },
            { text: '  â”‚  reporting system.                             â”‚', cls: '' },
            { text: '  â”œâ”€ Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤', cls: 'success' },
            { text: '  â”‚  Malware Analyzed: 500+                        â”‚', cls: 'error' },
            { text: '  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜', cls: 'success' },
        ],
        '~/projects/packetprowler.py': [
            { text: '  â”Œâ”€ PacketProwler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”', cls: 'success' },
            { text: '  â”‚  Type : Defense                                â”‚', cls: '' },
            { text: '  â”‚  Tech : Python, Scapy, ML                      â”‚', cls: 'info' },
            { text: '  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤', cls: 'success' },
            { text: '  â”‚  Real-time network packet analysis and anomaly â”‚', cls: '' },
            { text: '  â”‚  detection system. Uses machine learning to    â”‚', cls: '' },
            { text: '  â”‚  recognize attack patterns.                    â”‚', cls: '' },
            { text: '  â”œâ”€ Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤', cls: 'success' },
            { text: '  â”‚  Detection Rate: 98.7%                         â”‚', cls: 'success' },
            { text: '  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜', cls: 'success' },
        ],
        '~/projects/ctf_writeups.md': [
            { text: '  â”Œâ”€ CTF Writeups â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”', cls: 'success' },
            { text: '  â”‚  Type : Offense                                â”‚', cls: '' },
            { text: '  â”‚  Tech : HackTheBox, CTF, Writeup               â”‚', cls: 'info' },
            { text: '  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤', cls: 'success' },
            { text: '  â”‚  Detailed writeup collection of challenges     â”‚', cls: '' },
            { text: '  â”‚  solved on HackTheBox, TryHackMe and           â”‚', cls: '' },
            { text: '  â”‚  international CTF competitions.               â”‚', cls: '' },
            { text: '  â”œâ”€ Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤', cls: 'success' },
            { text: '  â”‚  Solved: 200+ Challenges                       â”‚', cls: 'success' },
            { text: '  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜', cls: 'success' },
        ],
    };

    function resolvePath(p) {
        if (p.startsWith('~/') || p === '~') return p;
        if (p.startsWith('/')) return '~' + p;
        if (cwd === '~') return '~/' + p;
        return cwd + '/' + p;
    }

    function addOutput(lines) {
        lines.forEach(l => {
            const p = document.createElement('p');
            if (l.cls === 'ascii-art') {
                p.className = 'ascii-art';
                p.textContent = l.text;
            } else {
                p.className = l.cls || '';
                p.textContent = l.text;
            }
            output.appendChild(p);
        });
        requestAnimationFrame(() => { scrollElementToBottom(body); });
    }

    // Welcome message
    addOutput([
        { text: FS_BANNER, cls: 'ascii-art' },
        { text: '', cls: '' },
        { text: '  â–ˆâ–ˆ Ã–mer Burak AkÃ§Ä±nar â€” IT & Cybersecurity Portfolio â–ˆâ–ˆ', cls: 'success' },
        { text: '  CLI Mode â€” Navigate my files to learn about me.', cls: 'info' },
        { text: '', cls: '' },
        { text: '  Type "help" for available commands.', cls: 'info' },
        { text: '  Type "gui" to switch to visual portfolio mode.', cls: 'dim' },
        { text: '', cls: '' },
    ]);

    const COMMANDS = {
        help: () => [
            { text: '', cls: '' },
            { text: '  â”Œâ”€ Available Commands â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”', cls: 'success' },
            { text: '  â”‚                                                â”‚', cls: '' },
            { text: '  â”‚  ls [dir]      â€” List files / directories      â”‚', cls: '' },
            { text: '  â”‚  cd <dir>      â€” Change directory              â”‚', cls: '' },
            { text: '  â”‚  cat <file>    â€” View file contents            â”‚', cls: '' },
            { text: '  â”‚  pwd           â€” Print current directory       â”‚', cls: '' },
            { text: '  â”‚  tree          â€” Show full directory tree       â”‚', cls: '' },
            { text: '  â”‚  whoami        â€” Who am I?                     â”‚', cls: '' },
            { text: '  â”‚  uname -a      â€” System info                   â”‚', cls: '' },
            { text: '  â”‚  date          â€” Current date/time             â”‚', cls: '' },
            { text: '  â”‚  neofetch      â€” System overview               â”‚', cls: '' },
            { text: '  â”‚  banner        â€” Show ASCII banner             â”‚', cls: '' },
            { text: '  â”‚  theme <name>  â€” Switch theme (kali/green/red) â”‚', cls: '' },
            { text: '  â”‚  gui           â€” Switch to visual mode         â”‚', cls: '' },
            { text: '  â”‚  exit          â€” Close terminal, open GUI       â”‚', cls: '' },
            { text: '  â”‚  clear         â€” Clear terminal                â”‚', cls: '' },
            { text: '  â”‚  history       â€” Command history               â”‚', cls: '' },
            { text: '  â”‚  sudo          â€” Try sudo ;)                   â”‚', cls: '' },
            { text: '  â”‚                                                â”‚', cls: '' },
            { text: '  â”‚  Tip: cd experience && cat 03_cyber_intern.log â”‚', cls: 'info' },
            { text: '  â”‚                                                â”‚', cls: '' },
            { text: '  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜', cls: 'success' },
            { text: '', cls: '' },
        ],
        pwd: () => [{ text: '  ' + cwd, cls: 'info' }],
        whoami: () => [{ text: '  root â€” viewing oba_portfolio from ' + window.location.hostname, cls: 'success' }],
        date: () => [{ text: '  ' + new Date().toLocaleString(), cls: 'info' }],
        banner: () => [{ text: FS_BANNER, cls: 'ascii-art' }],
        neofetch: () => [
            { text: '', cls: '' },
            { text: '         ,.        root@oba-sec', cls: 'info' },
            { text: '        ,;:;,      â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€', cls: 'info' },
            { text: '       ;:;:;\';     OS    : Kali GNU/Linux Rolling', cls: '' },
            { text: '      \';:;:\';\'    Kernel: 6.8.0-kali1-amd64', cls: '' },
            { text: '     \';:;:;:\';    Shell : zsh 5.9', cls: '' },
            { text: '    \';:;:;:;\';    User  : Ã–mer Burak AkÃ§Ä±nar', cls: '' },
            { text: '      \'\';:\';\'     Role  : IT & Cybersecurity', cls: '' },
            { text: '       \',:;\'      Loc   : Dublin, Ireland', cls: '' },
            { text: '         \'        Certs : CompTIA A+, Cisco Cyber', cls: '' },
            { text: '                  Uptime: Always learning', cls: 'success' },
            { text: '', cls: '' },
        ],
        tree: () => {
            const lines = [
                { text: '  ~/', cls: 'success' },
                { text: '  â”œâ”€â”€ README.md', cls: '' },
                { text: '  â”œâ”€â”€ about.txt', cls: '' },
                { text: '  â”œâ”€â”€ contact.json', cls: '' },
                { text: '  â”œâ”€â”€ skills.txt', cls: '' },
                { text: '  â”œâ”€â”€ certs.txt', cls: '' },
                { text: '  â”œâ”€â”€ experience/', cls: 'info' },
                { text: '  â”‚   â”œâ”€â”€ 01_barista.log', cls: '' },
                { text: '  â”‚   â”œâ”€â”€ 02_team_leader.log', cls: '' },
                { text: '  â”‚   â”œâ”€â”€ 03_cyber_intern.log', cls: '' },
                { text: '  â”‚   â””â”€â”€ 04_tech_support.log', cls: '' },
                { text: '  â”œâ”€â”€ education/', cls: 'info' },
                { text: '  â”‚   â”œâ”€â”€ 01_griffith_college.txt', cls: '' },
                { text: '  â”‚   â””â”€â”€ 02_sdu_university.txt', cls: '' },
                { text: '  â””â”€â”€ projects/', cls: 'info' },
                { text: '      â”œâ”€â”€ netsweep_scanner.sh', cls: '' },
                { text: '      â”œâ”€â”€ webcrawl_pro.py', cls: '' },
                { text: '      â”œâ”€â”€ cryptovault.cpp', cls: '' },
                { text: '      â”œâ”€â”€ malsandbox.docker', cls: '' },
                { text: '      â”œâ”€â”€ packetprowler.py', cls: '' },
                { text: '      â””â”€â”€ ctf_writeups.md', cls: '' },
                { text: '', cls: '' },
                { text: '  3 directories, 13 files', cls: 'dim' },
            ];
            return lines;
        },
        clear: () => 'CLEAR',
        history: () => {
            if (history.length === 0) return [{ text: '  No commands in history.', cls: 'dim' }];
            return history.map((cmd, i) => ({ text: `  ${i + 1}. ${cmd}`, cls: 'dim' }));
        },
        sudo: () => [
            { text: '  [sudo] password for root: ********', cls: 'error' },
            { text: '  Nice try! This incident will be reported. ðŸš¨', cls: 'error' },
        ],
    };

    function processCmd(raw) {
        const trimmed = raw.trim();
        if (!trimmed) return;

        history.push(trimmed);
        histIdx = history.length;

        // Echo command with prompt
        const echo = document.createElement('p');
        echo.className = 'cmd';
        echo.textContent = `root@oba-sec:${cwd}$ ${trimmed}`;
        output.appendChild(echo);
        requestAnimationFrame(() => { scrollElementToBottom(body); });

        const parts = trimmed.split(/\s+/);
        const cmd   = parts[0].toLowerCase();
        const args  = parts.slice(1);

        // Built-in commands
        if (cmd === 'gui' || cmd === 'exit') {
            addOutput([{ text: '  [*] Switching to GUI mode...', cls: 'info' }]);
            setTimeout(() => {
                sessionStorage.setItem('portfolio_mode', 'gui');
                syncModeUrl('gui');
                document.body.classList.remove('cli-mode');
                const fs = document.getElementById('fs-terminal');
                if (fs) {
                    fs.style.transition = 'opacity 0.5s ease';
                    fs.style.opacity = '0';
                    setTimeout(() => fs.remove(), 500);
                }
            }, 300);
            return;
        }

        if (cmd === 'theme') {
            const th = (args[0] || '').toLowerCase();
            if (isSupportedThemeName(th)) {
                applySiteTheme(th);
                addOutput([{ text: `  Theme switched to ${th}.`, cls: 'success' }]);
            } else {
                addOutput([{ text: '  Usage: theme <kali|green|red>', cls: 'error' }]);
            }
            return;
        }

        if (cmd === 'uname') {
            addOutput([{ text: '  Linux oba-sec 6.8.0-kali1-amd64 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux', cls: 'info' }]);
            return;
        }

        if (cmd === 'cd') {
            const target = args[0] || '~';
            const cleaned = target.replace(/\/$/, '');

            if (cleaned === '~' || cleaned === '/') {
                cwd = '~';
                updatePrompt();
                return;
            }
            if (cleaned === '..') {
                if (cwd !== '~') cwd = '~';
                updatePrompt();
                return;
            }

            const resolved = resolvePath(cleaned);
            if (FILESYSTEM[resolved]) {
                cwd = resolved;
                updatePrompt();
            } else {
                addOutput([{ text: `  bash: cd: ${target}: No such directory`, cls: 'error' }]);
            }
            return;
        }

        if (cmd === 'ls') {
            const target = args[0] ? resolvePath(args[0].replace(/\/$/, '')) : cwd;
            const dir = FILESYSTEM[target];
            if (dir) {
                const lines = dir.children.map(c => ({
                    text: '  ' + c,
                    cls: c.endsWith('/') ? 'info' : ''
                }));
                addOutput(lines);
            } else {
                addOutput([{ text: `  ls: cannot access '${args[0] || cwd}': No such directory`, cls: 'error' }]);
            }
            return;
        }

        if (cmd === 'cat') {
            if (!args[0]) {
                addOutput([{ text: '  Usage: cat <filename>', cls: 'error' }]);
                return;
            }
            const resolved = resolvePath(args[0]);
            if (FILES[resolved]) {
                addOutput(FILES[resolved]);
            } else if (FILESYSTEM[resolved]) {
                addOutput([{ text: `  cat: ${args[0]}: Is a directory`, cls: 'error' }]);
            } else {
                addOutput([{ text: `  cat: ${args[0]}: No such file`, cls: 'error' }]);
            }
            return;
        }

        if (COMMANDS[cmd]) {
            const result = COMMANDS[cmd]();
            if (result === 'CLEAR') {
                clearElementContent(output);
                return;
            }
            addOutput(result);
        } else {
            addOutput([
                { text: `  bash: ${cmd}: command not found`, cls: 'error' },
                { text: '  Type "help" for available commands.', cls: 'dim' },
            ]);
        }
    }

    function updatePrompt() {
        if (promptEl) promptEl.textContent = `root@oba-sec:${cwd}$`;
    }

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            processCmd(input.value);
            input.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (histIdx > 0) { histIdx--; input.value = history[histIdx]; }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (histIdx < history.length - 1) { histIdx++; input.value = history[histIdx]; }
            else { histIdx = history.length; input.value = ''; }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            autocomplete(input);
        } else if (e.key === 'l' && e.ctrlKey) {
            e.preventDefault();
            clearElementContent(output);
        }
    });

    // Tab autocomplete â€” real Kali-style
    let lastTabVal = null;
    let tabShownList = false;

    function autocomplete(inputEl) {
        const val = inputEl.value;

        // If input hasn't changed since last tab, and we already showed the list, do nothing
        if (val === lastTabVal && tabShownList) return;

        const inputChanged = (val !== lastTabVal);
        if (inputChanged) tabShownList = false;
        lastTabVal = val;

        // Split: "cat " â†’ cmd="cat", partial=""
        const spaceIdx = val.indexOf(' ');
        const hasArg = spaceIdx !== -1;
        const cmdPart = hasArg ? val.substring(0, spaceIdx) : val;
        const argPart = hasArg ? val.substring(spaceIdx + 1) : '';

        if (!hasArg) {
            // Command autocomplete
            const partial = cmdPart.toLowerCase();
            if (!partial) return;
            const cmds = ['help','ls','cd','cat','pwd','tree','whoami','date','neofetch','banner','theme','gui','exit','clear','history','sudo','uname'];
            const matches = cmds.filter(c => c.startsWith(partial));
            if (matches.length === 0) return;
            if (matches.length === 1) {
                inputEl.value = matches[0] + ' ';
                lastTabVal = inputEl.value;
            } else {
                const common = commonPrefix(matches);
                if (common.length > partial.length) {
                    inputEl.value = common;
                    lastTabVal = inputEl.value;
                } else {
                    // Show options once
                    addOutput(matches.map(m => ({ text: '  ' + m, cls: '' })));
                    requestAnimationFrame(() => { scrollElementToBottom(body); });
                    tabShownList = true;
                }
            }
        } else {
            // File/dir autocomplete
            const partial = argPart;
            const dir = FILESYSTEM[cwd];
            if (!dir) return;
            const matches = dir.children.filter(c => {
                const name = c.replace(/\/$/, '');
                return name.startsWith(partial);
            });
            if (matches.length === 0) return;
            if (matches.length === 1) {
                const completed = matches[0].replace(/\/$/, '');
                inputEl.value = cmdPart + ' ' + completed + ' ';
                lastTabVal = inputEl.value;
            } else {
                const stripped = matches.map(m => m.replace(/\/$/, ''));
                const common = commonPrefix(stripped);
                if (common.length > partial.length) {
                    inputEl.value = cmdPart + ' ' + common;
                    lastTabVal = inputEl.value;
                } else {
                    // Show options once
                    addOutput(matches.map(m => ({ text: '  ' + m, cls: m.endsWith('/') ? 'info' : '' })));
                    requestAnimationFrame(() => { scrollElementToBottom(body); });
                    tabShownList = true;
                }
            }
        }
    }

    function commonPrefix(arr) {
        if (!arr.length) return '';
        let prefix = arr[0];
        for (let i = 1; i < arr.length; i++) {
            while (!arr[i].startsWith(prefix)) {
                prefix = prefix.slice(0, -1);
                if (!prefix) return '';
            }
        }
        return prefix;
    }
}


// â”€â”€â”€ Custom Cursor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(function initCustomCursor() {
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const cursor = document.getElementById('custom-cursor');
    const trail  = document.getElementById('cursor-trail');
    if (!cursor || !trail) return;

    let mx = 0, my = 0;

    document.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
        cursor.style.left = mx + 'px';
        cursor.style.top  = my + 'px';
    });

    // Trail follows with slight delay
    function trailTick() {
        const tx = parseFloat(trail.style.left) || 0;
        const ty = parseFloat(trail.style.top)  || 0;
        trail.style.left = (tx + (mx - tx) * 0.25) + 'px';
        trail.style.top  = (ty + (my - ty) * 0.25) + 'px';
        requestAnimationFrame(trailTick);
    }
    trailTick();

    // Hover effect on interactive elements
    const hoverables = 'a, button, .project-card, .tool-tag, .stat-card, .filter-btn, .lang-toggle';
    document.querySelectorAll(hoverables).forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    // Hide default cursor
    document.body.style.cursor = 'none';
    document.querySelectorAll('a, button').forEach(el => el.style.cursor = 'none');
})();

// â”€â”€â”€ Particle System â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const particles = [];
    const COUNT = 60;

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function Particle() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 0.5;
    }

    function init() {
        resize();
        for (let i = 0; i < COUNT; i++) particles.push(new Particle());
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(82, 148, 226, 0.3)';
            ctx.fill();

            // Draw connections
            for (let j = i + 1; j < particles.length; j++) {
                const q = particles[j];
                const dx = p.x - q.x;
                const dy = p.y - q.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.strokeStyle = 'rgba(82, 148, 226, ' + (0.1 * (1 - dist / 150)) + ')';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }

    init();
    window.addEventListener('resize', resize);
    draw();
})();

// â”€â”€â”€ Matrix Rain (Mouse-Reactive) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(function initMatrix() {
    const canvas  = document.getElementById('matrix-canvas');
    const ctx     = canvas.getContext('2d');
    const CHARS   = 'ã‚¢ã‚¤ã‚¦ã‚¨ã‚ªã‚«ã‚­ã‚¯ã‚±ã‚³ã‚µã‚·ã‚¹ã‚»ã‚½ã‚¿ãƒãƒ„ãƒ†ãƒˆãƒŠãƒ‹ãƒŒãƒãƒŽ01ã‚¢BAD0x</>{}[]$#@!%^&*';
    const FONT_SZ = 14;
    let cols, drops, speeds, brightness;
    let mouseX = -1, mouseY = -1;
    const MOUSE_RADIUS = 150;

    function getThemeColor(alpha) {
        const style = document.body.dataset.theme;
        if (style === 'red') return 'rgba(255, 85, 85, ' + alpha + ')';
        if (style === 'green') return 'rgba(0, 255, 65, ' + alpha + ')';
        return 'rgba(82, 148, 226, ' + alpha + ')';
    }

    function getThemeHex() {
        const style = document.body.dataset.theme;
        if (style === 'red') return '#ff5555';
        if (style === 'green') return '#00ff41';
        return '#5294e2';
    }

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        cols  = Math.floor(canvas.width / FONT_SZ);
        drops = Array(cols).fill(0).map(() => Math.random() * (canvas.height / FONT_SZ));
        speeds = Array(cols).fill(0).map(() => 0.3 + Math.random() * 0.8);
        brightness = Array(cols).fill(0).map(() => 0.3 + Math.random() * 0.7);
    }

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function draw() {
        // Fade trail â€” slower fade = longer trails
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < drops.length; i++) {
            const x = i * FONT_SZ;
            const y = Math.floor(drops[i]) * FONT_SZ;
            const dx = x - mouseX;
            const dy = y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const char = CHARS[Math.floor(Math.random() * CHARS.length)];

            // Mouse proximity â€” bright glow
            if (dist < MOUSE_RADIUS) {
                const intensity = 1 - (dist / MOUSE_RADIUS);
                ctx.fillStyle = getThemeColor(0.4 + intensity * 0.6);
                ctx.font = (FONT_SZ + intensity * 8) + 'px monospace';
                ctx.fillText(char, x, y);
                ctx.font = FONT_SZ + 'px monospace';
            } else {
                // Head character â€” bright white/blue
                ctx.fillStyle = getThemeColor(brightness[i] * 0.8);
                ctx.font = FONT_SZ + 'px monospace';
                ctx.fillText(char, x, y);
            }

            // Draw head glow (leading character is brighter)
            if (Math.random() > 0.97) {
                ctx.fillStyle = '#fff';
                ctx.fillText(char, x, y);
            }

            drops[i] += speeds[i];

            if (drops[i] * FONT_SZ > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
                speeds[i] = 0.3 + Math.random() * 0.8;
                brightness[i] = 0.3 + Math.random() * 0.7;
            }
        }
    }

    resize();
    window.addEventListener('resize', resize);
    setInterval(draw, 45);
})();


// â”€â”€â”€ Typewriter Utility â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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


// â”€â”€â”€ Hero Terminal Sequence â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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


// â”€â”€â”€ Logo Typewriter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function runLogoType() {
    const el   = document.getElementById('logo-type');
    const text = 'OBA_SEC';
    typewrite(el, text, 100);
}


// â”€â”€â”€ Smooth Nav Active State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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


// â”€â”€â”€ Fade-In on Scroll â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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


// â”€â”€â”€ Skill Bar Animation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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


// â”€â”€â”€ Stat Counter Animation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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


// â”€â”€â”€ Contact Form (Backend API) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// â”€â”€â”€ Contact Form feature moved to feature-contact.js â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// initContactForm is now defined in feature-contact.js and wired from DOMContentLoaded.
function initGlitch() {
    const logo = document.querySelector('.nav-logo');
    if (!logo) return;

    logo.addEventListener('mouseenter', () => {
        logo.style.textShadow = '2px 0 #00ffff, -2px 0 #ff0040';
        setTimeout(() => logo.style.textShadow = '', 200);
    });
}


// â”€â”€â”€ Keyboard Shortcut: G for GitHub (example Easter Egg) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initKeyboardEasterEgg() {
    const sequence = [];
    const CODE     = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight'];

    document.addEventListener('keydown', e => {
        sequence.push(e.key);
        if (sequence.length > CODE.length) sequence.shift();
        if (sequencesEqual(sequence, CODE)) {
            flashScreen();
        }
    });
}

function flashScreen() {
    const flash = document.createElement('div');
    flash.style.cssText = [
        'position:fixed','top:0','left:0','width:100%','height:100%',
        'background:rgba(82,148,226,0.15)','z-index:9999',
        'pointer-events:none','transition:opacity 0.5s'
    ].join(';');
    document.body.appendChild(flash);
    setTimeout(() => { flash.style.opacity = '0'; }, 100);
    setTimeout(() => flash.remove(), 600);

    const msg = document.createElement('div');
    msg.textContent = '// ACCESS GRANTED â€” KONAMI CODE DETECTED';
    msg.style.cssText = [
        'position:fixed','top:50%','left:50%',
        'transform:translate(-50%,-50%)',
        'color:#5294e2','font-family:monospace','font-size:1.2rem',
        'z-index:10000',
        'pointer-events:none','transition:opacity 0.5s'
    ].join(';');
    document.body.appendChild(msg);
    setTimeout(() => { msg.style.opacity = '0'; }, 2500);
    setTimeout(() => msg.remove(), 3000);
}


// â”€â”€â”€ Mobile Nav Toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initMobileNav() {
    const btn   = document.getElementById('mobile-menu-btn');
    const links = document.getElementById('nav-links');
    if (!btn || !links) return;

    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        links.classList.toggle('open');
    });

    // Close menu on link click
    links.querySelectorAll('.nav-link').forEach(l => {
        l.addEventListener('click', () => {
            btn.classList.remove('active');
            links.classList.remove('open');
        });
    });
}


// â”€â”€â”€ Project Filters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initProjectFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards   = document.querySelectorAll('.project-card[data-category]');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            cards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.classList.remove('filter-hidden');
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    requestAnimationFrame(() => {
                        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    });
                } else {
                    card.classList.add('filter-hidden');
                }
            });
        });
    });
}


// â”€â”€â”€ Back to Top â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}


// â”€â”€â”€ Nav Scroll Effect â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initNavScroll() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
    });
}


// â”€â”€â”€ Server Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initServerStats() {
    const statusEl = document.getElementById('server-status');
    const uptimeEl = document.getElementById('server-uptime');
    const visitorEl = document.getElementById('visitor-count');

    if (!statusEl) return;

    function fetchStats() {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => {
                if (uptimeEl) {
                    uptimeEl.textContent = formatUptimeSeconds(data.uptime);
                }
                if (visitorEl) {
                    visitorEl.textContent = data.visitors;
                }
                if (statusEl) {
                    statusEl.textContent = 'â— ONLINE';
                    statusEl.className = 'val success';
                }
            })
            .catch(() => {
                if (statusEl) {
                    statusEl.textContent = 'â— OFFLINE';
                    statusEl.className = 'val warn';
                }
            });
    }

    fetchStats();
    setInterval(fetchStats, 30000);
}


// â”€â”€â”€ Staggered Timeline Animation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initTimelineAnim() {
    const items = document.querySelectorAll('.timeline-item');

    items.forEach(el => el.classList.add('fade-in'));

    const obs = new IntersectionObserver(entries => {
        entries.forEach((e, idx) => {
            if (e.isIntersecting) {
                setTimeout(() => {
                    e.target.classList.add('visible');
                }, idx * 150);
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.2 });

    items.forEach(el => obs.observe(el));
}


// â”€â”€â”€ Section Header Typewriter on Scroll â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initSectionTypewriter() {
    const headers = document.querySelectorAll('.section-header');

    headers.forEach(header => {
        const titleEl = header.querySelector('.section-title');
        if (!titleEl) return;

        // Find the i18n text span inside the title
        const textSpan = titleEl.querySelector('[data-i18n]');
        const cursorSpan = titleEl.querySelector('.cursor-blink');
        if (!textSpan) return;

        // Store original text
        const origText = textSpan.textContent;
        textSpan.textContent = '';
        if (cursorSpan) cursorSpan.style.display = 'none';

        header._typewriterDone = false;
        header._origText = origText;
        header._textSpan = textSpan;
        header._cursorSpan = cursorSpan;
    });

    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target._typewriterDone) {
                entry.target._typewriterDone = true;
                const span = entry.target._textSpan;
                const cursor = entry.target._cursorSpan;
                const text = entry.target._origText;

                if (cursor) {
                    cursor.style.display = 'inline';
                    cursor.classList.remove('cursor-blink');
                    cursor.classList.add('cursor-blink');
                }

                let i = 0;
                const iv = setInterval(() => {
                    i++;
                    span.textContent = text.substring(0, i);
                    if (i >= text.length) {
                        clearInterval(iv);
                    }
                }, 40);

                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    headers.forEach(h => obs.observe(h));
}


// â”€â”€â”€ Scroll Progress Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
        bar.style.width = pct + '%';
    }, { passive: true });
}


// â”€â”€â”€ Section Content Reveal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initSectionReveal() {
    const sections = document.querySelectorAll('.section');

    sections.forEach(sec => {
        const container = sec.querySelector('.container');
        if (!container) return;
        // Skip the header, animate the rest
        const children = container.children;
        for (let i = 0; i < children.length; i++) {
            if (!children[i].classList.contains('section-header')) {
                children[i].classList.add('fade-in-stagger');
            }
        }
    });

    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const staggerEls = entry.target.querySelectorAll('.fade-in-stagger');
                staggerEls.forEach((el, idx) => {
                    setTimeout(() => el.classList.add('visible'), idx * 120);
                });
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(s => obs.observe(s));
}


// â”€â”€â”€ Boot â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function runIfReady(nameOrFn) {
    const initFn = typeof nameOrFn === 'string' ? window[nameOrFn] : nameOrFn;
    if (typeof initFn === 'function') {
        initFn();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    runLogoType();
    runHeroTerminal();
    initNavActiveState();
    initFadeIn();
    initSkillBars();
    initStatCounters();
    runIfReady('initContactForm');
    initGlitch();
    initKeyboardEasterEgg();
    initMobileNav();
    initProjectFilters();
    initBackToTop();
    initNavScroll();
    initServerStats();
    initTimelineAnim();
    initSectionTypewriter();
    initSectionReveal();
    initScrollProgress();
    runIfReady('initThemeSwitcher');
    initToastSystem();
    runIfReady('initCommandPalette');
    initLiveTerminal();
    initSkillRadar();
    init3DTilt();
    initTextDecrypt();
    initHoverScramble();
    initTimelineDraw();
    initFloatingParticles();
    initStatFlicker();
    initSectionParallax();
    initMouseGlow();
    initScrollIndicator();
});


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//   v4.0 â€” New Feature Modules
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€â”€ Toast Notification System â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

function initToastSystem() {
    // Toast is globally available via showToast()
    window.showToast = showToast;
}

// â”€â”€â”€ Theme Switcher â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// â”€â”€â”€ Theme + Command Palette features moved to feature-theme.js and feature-command-palette.js
// initThemeSwitcher and initCommandPalette are now defined in feature modules.
function initLiveTerminal() {
    const input  = document.getElementById('live-term-input');
    const output = document.getElementById('live-term-output');
    const body   = document.getElementById('live-terminal-body');
    if (!input || !output) return;

    // Focus input when user clicks anywhere in the terminal body
    if (body) body.addEventListener('click', () => input.focus());

    const history = [];
    let histIdx = -1;

    const ASCII_BANNER = `
 â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•— â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—    â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•— â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•— â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—
 â–ˆâ–ˆâ•”â•â•â•â•â•â–ˆâ–ˆâ•”â•â•â•â•â•â–ˆâ–ˆâ•”â•â•â•â•â•    â–ˆâ–ˆâ•”â•â•â–ˆâ–ˆâ•—â–ˆâ–ˆâ•”â•â•â•â–ˆâ–ˆâ•—â–ˆâ–ˆâ•”â•â•â–ˆâ–ˆâ•—â•šâ•â•â–ˆâ–ˆâ•”â•â•â•
 â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—  â–ˆâ–ˆâ•‘         â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•”â•â–ˆâ–ˆâ•‘   â–ˆâ–ˆâ•‘â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•”â•   â–ˆâ–ˆâ•‘   
 â•šâ•â•â•â•â–ˆâ–ˆâ•‘â–ˆâ–ˆâ•”â•â•â•  â–ˆâ–ˆâ•‘         â–ˆâ–ˆâ•”â•â•â•â• â–ˆâ–ˆâ•‘   â–ˆâ–ˆâ•‘â–ˆâ–ˆâ•”â•â•â–ˆâ–ˆâ•—   â–ˆâ–ˆâ•‘   
 â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•‘â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—â•šâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•—    â–ˆâ–ˆâ•‘     â•šâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ•”â•â–ˆâ–ˆâ•‘  â–ˆâ–ˆâ•‘   â–ˆâ–ˆâ•‘   
 â•šâ•â•â•â•â•â•â•â•šâ•â•â•â•â•â•â• â•šâ•â•â•â•â•â•    â•šâ•â•      â•šâ•â•â•â•â•â• â•šâ•â•  â•šâ•â•   â•šâ•â•`;

    const COMMANDS = {
        help: () => [
            { text: '  help         â€” Show available commands', cls: 'info' },
            { text: '  about        â€” About me', cls: '' },
            { text: '  skills       â€” List skills', cls: '' },
            { text: '  projects     â€” Show projects', cls: '' },
            { text: '  contact      â€” Contact info', cls: '' },
            { text: '  theme <name> â€” Switch theme (kali/green/red)', cls: '' },
            { text: '  whoami       â€” Who are you?', cls: '' },
            { text: '  date         â€” Current date/time', cls: '' },
            { text: '  uptime       â€” Server uptime', cls: '' },
            { text: '  matrix       â€” Toggle matrix rain', cls: '' },
            { text: '  banner       â€” Show ASCII banner', cls: '' },
            { text: '  clear        â€” Clear terminal', cls: '' },
            { text: '  history      â€” Command history', cls: '' },
            { text: '  sudo         â€” Try sudo ;)', cls: '' },
        ],
        about: () => [
            { text: 'â”Œâ”€ About â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”', cls: 'success' },
            { text: 'â”‚ Ã–mer Burak AkÃ§Ä±nar                          â”‚', cls: '' },
            { text: 'â”‚ IT & Cybersecurity Professional              â”‚', cls: '' },
            { text: 'â”‚ Incident Response, Threat Detection, IT Ops  â”‚', cls: '' },
            { text: 'â”‚ Based in Dublin, Ireland                     â”‚', cls: '' },
            { text: 'â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜', cls: 'success' },
        ],
        skills: () => [
            { text: '  [â– â– â– â– â– â– â– â– â– â–‘]  92%  IT Support & Troubleshooting', cls: 'success' },
            { text: '  [â– â– â– â– â– â– â– â– â– â–‘]  90%  Windows', cls: 'success' },
            { text: '  [â– â– â– â– â– â– â– â– â–‘â–‘]  85%  Linux', cls: 'success' },
            { text: '  [â– â– â– â– â– â– â– â– â–‘â–‘]  80%  Networking (DNS/DHCP/VPN)', cls: 'info' },
            { text: '  [â– â– â– â– â– â– â– â– â–‘â–‘]  80%  Incident Response', cls: 'info' },
            { text: '  [â– â– â– â– â– â– â– â–‘â–‘â–‘]  78%  Vulnerability Assessment', cls: '' },
            { text: '  [â– â– â– â– â– â– â– â–‘â–‘â–‘]  75%  Active Directory', cls: '' },
            { text: '  [â– â– â– â– â– â– â– â–‘â–‘â–‘]  75%  Threat Detection', cls: '' },
        ],
        projects: () => [
            { text: '  [01] NetHunter Toolkit    â€” Network scanner & analyzer', cls: 'success' },
            { text: '  [02] CryptoVault          â€” Encrypted file manager', cls: 'success' },
            { text: '  [03] WebShield WAF        â€” Custom web app firewall', cls: 'info' },
            { text: '  [04] MalwareScope         â€” Binary analysis tool', cls: 'info' },
            { text: '  [05] PhishGuard           â€” Anti-phishing browser ext', cls: '' },
            { text: '  [06] SecAudit Framework   â€” Automated auditing', cls: '' },
        ],
        contact: () => [
            { text: '  ðŸ“§ Email      : omerburaka95@gmail.com', cls: 'info' },
            { text: '  ðŸ™ GitHub     : github.com/somestr', cls: '' },
            { text: '  ðŸ’¼ LinkedIn   : linkedin.com/in/omerburaka', cls: '' },
            { text: '  ðŸ”“ TryHackMe : tryhackme.com/p/somestr  [Top 5% | Mage]', cls: 'success' },
            { text: '  ðŸ“ Location   : Dublin, Ireland', cls: '' },
        ],
        whoami: () => [
            { text: '  visitor â€” Viewing oba_portfolio from ' + window.location.hostname, cls: 'success' },
        ],
        date: () => [
            { text: '  ' + new Date().toLocaleString(), cls: 'info' },
        ],
        uptime: () => {
            const start = window.__serverStartTime || Date.now();
            const diff = Date.now() - start;
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            return [{ text: `  Session uptime: ${h}h ${m}m`, cls: 'info' }];
        },
        banner: () => [
            { text: ASCII_BANNER, cls: 'ascii-art' },
        ],
        matrix: () => {
            const mc = document.getElementById('matrix-canvas');
            if (mc) {
                mc.style.display = mc.style.display === 'none' ? 'block' : 'none';
                return [{ text: '  Matrix rain toggled.', cls: 'success' }];
            }
            return [{ text: '  Matrix canvas not found.', cls: 'error' }];
        },
        clear: () => 'CLEAR',
        history: () => {
            if (history.length === 0) return [{ text: '  No commands in history.', cls: 'dim' }];
            return history.map((cmd, i) => ({ text: `  ${i + 1}. ${cmd}`, cls: 'dim' }));
        },
        sudo: () => [
            { text: '  [sudo] password for visitor: ********', cls: 'error' },
            { text: '  visitor is not in the sudoers file. This incident will be reported. ðŸš¨', cls: 'error' },
        ],
    };

    function addOutput(lines) {
        lines.forEach(l => {
            const p = document.createElement('p');
            if (l.cls === 'ascii-art') {
                p.className = 'ascii-art';
                p.textContent = l.text;
            } else {
                p.className = l.cls || '';
                p.textContent = l.text;
            }
            output.appendChild(p);
        });
        requestAnimationFrame(() => {
            scrollElementToBottom(output);
        });
    }

    function processCmd(raw) {
        const trimmed = raw.trim();
        if (!trimmed) return;

        history.push(trimmed);
        histIdx = history.length;

        // Echo command
        const echo = document.createElement('p');
        echo.className = 'cmd';
        echo.textContent = `visitor@oba_sec:~$ ${trimmed}`;
        output.appendChild(echo);
        requestAnimationFrame(() => { scrollElementToBottom(output); });

        const parts = trimmed.split(/\s+/);
        const cmd   = parts[0].toLowerCase();
        const args  = parts.slice(1);

        // Theme command
        if (cmd === 'theme') {
            const th = (args[0] || '').toLowerCase();
            if (isSupportedThemeName(th)) {
                applySiteTheme(th);
                addOutput([{ text: `  Theme switched to ${th}.`, cls: 'success' }]);
            } else {
                addOutput([{ text: '  Usage: theme <kali|green|red>', cls: 'error' }]);
            }
            return;
        }

        if (COMMANDS[cmd]) {
            const result = COMMANDS[cmd]();
            if (result === 'CLEAR') {
                clearElementContent(output);
                return;
            }
            addOutput(result);
        } else {
            addOutput([
                { text: `  bash: ${cmd}: command not found`, cls: 'error' },
                { text: '  Type "help" for available commands.', cls: 'dim' },
            ]);
        }
    }

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            processCmd(input.value);
            input.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (histIdx > 0) {
                histIdx--;
                input.value = history[histIdx];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (histIdx < history.length - 1) {
                histIdx++;
                input.value = history[histIdx];
            } else {
                histIdx = history.length;
                input.value = '';
            }
        }
    });

    window.__serverStartTime = Date.now();
}

// â”€â”€â”€ Skill Radar Chart (Canvas) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initSkillRadar() {
    const canvas = document.getElementById('skill-radar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const skills = [
        { label: 'IT Support',  value: 0.92 },
        { label: 'Windows',     value: 0.90 },
        { label: 'Linux',       value: 0.85 },
        { label: 'Networking',  value: 0.80 },
        { label: 'Incident Resp', value: 0.80 },
        { label: 'Vuln Assess', value: 0.78 },
    ];

    const n = skills.length;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const maxR = Math.min(cx, cy) - 50;
    const levels = 5;

    function getColor() {
        const theme = document.body.dataset.theme;
        if (theme === 'green') return { main: '#00ff41', dim: 'rgba(0,255,65,', fill: 'rgba(0,255,65,0.15)' };
        if (theme === 'red') return { main: '#ff5555', dim: 'rgba(255,85,85,', fill: 'rgba(255,85,85,0.15)' };
        return { main: '#5294e2', dim: 'rgba(82,148,226,', fill: 'rgba(82,148,226,0.15)' };
    }

    let animProgress = 0;

    function drawRadar() {
        const c = getColor();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Grid
        for (let lvl = 1; lvl <= levels; lvl++) {
            const r = (maxR / levels) * lvl;
            ctx.beginPath();
            for (let i = 0; i <= n; i++) {
                const angle = (Math.PI * 2 / n) * i - Math.PI / 2;
                const x = cx + r * Math.cos(angle);
                const y = cy + r * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = c.dim + '0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Axes
        for (let i = 0; i < n; i++) {
            const angle = (Math.PI * 2 / n) * i - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + maxR * Math.cos(angle), cy + maxR * Math.sin(angle));
            ctx.strokeStyle = c.dim + '0.2)';
            ctx.stroke();
        }

        // Data polygon
        const progress = Math.min(animProgress, 1);
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
            const idx = i % n;
            const angle = (Math.PI * 2 / n) * idx - Math.PI / 2;
            const r = maxR * skills[idx].value * progress;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.fillStyle = c.fill;
        ctx.fill();
        ctx.strokeStyle = c.main;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Dots + Labels
        for (let i = 0; i < n; i++) {
            const angle = (Math.PI * 2 / n) * i - Math.PI / 2;
            const r = maxR * skills[i].value * progress;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = c.main;
            ctx.fill();

            // Labels
            const lx = cx + (maxR + 25) * Math.cos(angle);
            const ly = cy + (maxR + 25) * Math.sin(angle);
            ctx.fillStyle = c.dim + '0.7)';
            ctx.font = '11px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(skills[i].label, lx, ly);

            // Value
            ctx.fillStyle = c.main;
            ctx.font = '9px monospace';
            ctx.fillText(Math.round(skills[i].value * 100 * progress) + '%', lx, ly + 14);
        }
    }

    // Animate on scroll into view
    let animated = false;
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting && !animated) {
                animated = true;
                const start = performance.now();
                const duration = 1200;
                function tick(now) {
                    animProgress = Math.min((now - start) / duration, 1);
                    drawRadar();
                    if (animProgress < 1) requestAnimationFrame(tick);
                }
                requestAnimationFrame(tick);
                obs.unobserve(canvas);
            }
        });
    }, { threshold: 0.3 });

    obs.observe(canvas);

    // Redraw on theme change (observer on body attribute)
    const bodyObs = new MutationObserver(() => { if (animated) drawRadar(); });
    bodyObs.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
}

// â”€â”€â”€ 3D Tilt Cards (disabled) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function init3DTilt() { /* simplified â€” removed 3D tilt for cleaner look */ }

// â”€â”€â”€ Text Decrypt Effect â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initTextDecrypt() {
    const targets = document.querySelectorAll('.section-title');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const el = e.target;
                const original = el.textContent;
                let iteration = 0;

                const interval = setInterval(() => {
                    el.textContent = original
                        .split('')
                        .map((char, idx) => {
                            if (char === ' ') return ' ';
                            if (idx < iteration) return original[idx];
                            return chars[Math.floor(Math.random() * chars.length)];
                        })
                        .join('');

                    if (iteration >= original.length) clearInterval(interval);
                    iteration += 1 / 2;
                }, 30);

                obs.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    targets.forEach(t => obs.observe(t));
}


// â”€â”€â”€ Text Scramble on Hover â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initHoverScramble() {
    const GLITCH = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`01';
    const targets = document.querySelectorAll('.project-title, .timeline-title, .skill-cat-title, .card-header');

    targets.forEach(el => {
        let original = '';
        let running = false;

        el.addEventListener('mouseenter', () => {
            if (running) return;
            running = true;
            original = el.textContent;
            let iter = 0;
            const iv = setInterval(() => {
                el.textContent = original
                    .split('')
                    .map((ch, i) => {
                        if (ch === ' ') return ' ';
                        if (i < iter) return original[i];
                        return GLITCH[Math.floor(Math.random() * GLITCH.length)];
                    })
                    .join('');
                if (iter >= original.length) {
                    clearInterval(iv);
                    el.textContent = original;
                    running = false;
                }
                iter += 1;
            }, 25);
        });
    });
}


// â”€â”€â”€ Animated Timeline Draw Line â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initTimelineDraw() {
    const line = document.querySelector('.timeline::before') ? null : null;
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;

    // Create a draw-line element
    const drawLine = document.createElement('div');
    drawLine.className = 'timeline-draw-line';
    timeline.prepend(drawLine);

    function update() {
        const rect = timeline.getBoundingClientRect();
        const winH = window.innerHeight;
        if (rect.top > winH || rect.bottom < 0) {
            drawLine.style.height = '0px';
            return;
        }
        const visible = Math.min(winH - rect.top, rect.height);
        const pct = Math.max(0, Math.min(1, visible / rect.height));
        drawLine.style.height = (pct * 100) + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
}


// â”€â”€â”€ Floating Particles (lightweight) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initFloatingParticles() {
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const container = document.createElement('div');
    container.className = 'floating-particles';
    document.body.appendChild(container);

    const COUNT = 25;
    const chars = ['0', '1', '<', '>', '/', '{', '}', '#', '$', '%', '@', '*'];

    for (let i = 0; i < COUNT; i++) {
        const p = document.createElement('span');
        p.className = 'float-char';
        p.textContent = chars[Math.floor(Math.random() * chars.length)];
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (8 + Math.random() * 16) + 's';
        p.style.animationDelay = (Math.random() * 10) + 's';
        p.style.fontSize = (0.5 + Math.random() * 0.6) + 'rem';
        p.style.opacity = 0.03 + Math.random() * 0.05;
        container.appendChild(p);
    }
}


// â”€â”€â”€ Stat Counter Flicker Effect â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initStatFlicker() {
    const nums = document.querySelectorAll('.stat-num');
    nums.forEach(el => {
        el.addEventListener('mouseenter', () => {
            const val = el.textContent;
            let flicks = 0;
            const iv = setInterval(() => {
                el.style.opacity = Math.random() > 0.3 ? '1' : '0.3';
                flicks++;
                if (flicks > 8) {
                    clearInterval(iv);
                    el.style.opacity = '1';
                }
            }, 50);
        });
    });
}


// â”€â”€â”€ Section Parallax Depth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initSectionParallax() {
    const dividers = document.querySelectorAll('.section-divider');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        dividers.forEach(d => {
            const rect = d.getBoundingClientRect();
            if (rect.top > -100 && rect.top < window.innerHeight + 100) {
                const offset = (rect.top - window.innerHeight / 2) * 0.03;
                d.style.transform = 'translateY(' + offset + 'px)';
            }
        });
    }, { passive: true });
}


// â”€â”€â”€ Mouse Glow Follower â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initMouseGlow() {
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const glow = document.createElement('div');
    glow.className = 'mouse-glow';
    document.body.appendChild(glow);

    let mx = 0, my = 0, cx = 0, cy = 0;

    document.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
    });

    function tick() {
        cx += (mx - cx) * 0.08;
        cy += (my - cy) * 0.08;
        glow.style.left = cx + 'px';
        glow.style.top = cy + 'px';
        requestAnimationFrame(tick);
    }
    tick();
}


// â”€â”€â”€ Smooth Section Scroll Indicator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initScrollIndicator() {
    const sections = document.querySelectorAll('section[id]');
    const indicator = document.createElement('div');
    indicator.className = 'section-indicator';
    document.body.appendChild(indicator);

    sections.forEach((sec, i) => {
        const dot = document.createElement('div');
        dot.className = 'si-dot';
        dot.title = sec.id;
        dot.addEventListener('click', () => {
            sec.scrollIntoView({ behavior: 'smooth' });
        });
        indicator.appendChild(dot);
    });

    const dots = indicator.querySelectorAll('.si-dot');

    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const idx = Array.from(sections).indexOf(entry.target);
                dots.forEach((d, i) => d.classList.toggle('active', i === idx));
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(s => obs.observe(s));
}
