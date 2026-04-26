(function redirectGitHubPagesRoute(globalScope) {
    'use strict';

    const modeRoutes = new Set(['cli', 'entry', 'gui']);
    const segments = globalScope.location.pathname.split('/').filter(Boolean);
    const hasProjectBase = segments.length > 1 && !modeRoutes.has(segments[0]);
    const basePath = hasProjectBase ? '/' + segments[0] : '';
    const routeSegments = hasProjectBase ? segments.slice(1) : segments;
    const route = routeSegments.length > 0 ? '/' + routeSegments.join('/') : '/';

    if (route === '/cli' || route === '/gui') {
        globalScope.sessionStorage.setItem('intro_done', '1');
        globalScope.sessionStorage.setItem('portfolio_mode', route.slice(1));
    } else if (route === '/entry') {
        globalScope.sessionStorage.removeItem('intro_done');
        globalScope.sessionStorage.removeItem('portfolio_mode');
    }

    globalScope.location.replace(basePath + '/' + globalScope.location.search + globalScope.location.hash);
})(window);
