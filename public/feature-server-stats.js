(function initServerStatsFeature(globalScope) {
    'use strict';

    const AppUtils = globalScope.OBAUtils || {};
    const formatUptimeSeconds = AppUtils.formatUptimeSeconds || ((totalSeconds) => {
        const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours}h ${minutes}m ${remainingSeconds}s`;
    });

    function isStaticHost() {
        const location = globalScope.location;
        const hostname = (location && location.hostname) || '';
        return !location
            || location.protocol === 'file:'
            || /\.github\.io$/i.test(hostname);
    }

    function initServerStats() {
        const statusEl = globalScope.document.getElementById('server-status');
        const uptimeEl = globalScope.document.getElementById('server-uptime');
        const visitorEl = globalScope.document.getElementById('visitor-count');

        if (!statusEl) return;

        function setStaticMode() {
            if (uptimeEl) {
                uptimeEl.textContent = 'GitHub Pages';
            }
            if (visitorEl) {
                visitorEl.textContent = '--';
            }
            statusEl.textContent = '● STATIC';
            statusEl.className = 'val success';
        }

        function setOfflineMode() {
            statusEl.textContent = '● OFFLINE';
            statusEl.className = 'val warn';
        }

        if (isStaticHost() || typeof globalScope.fetch !== 'function') {
            setStaticMode();
            return;
        }

        function fetchStats() {
            globalScope.fetch('/api/stats')
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Stats endpoint unavailable');
                    }
                    return response.json();
                })
                .then((data) => {
                    if (uptimeEl) {
                        uptimeEl.textContent = formatUptimeSeconds(data.uptime);
                    }
                    if (visitorEl) {
                        visitorEl.textContent = data.visitors;
                    }
                    statusEl.textContent = '● ONLINE';
                    statusEl.className = 'val success';
                })
                .catch(setOfflineMode);
        }

        fetchStats();
        globalScope.setInterval(fetchStats, 30000);
    }

    globalScope.initServerStats = initServerStats;
})(typeof globalThis !== 'undefined' ? globalThis : this);
