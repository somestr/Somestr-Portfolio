(function openPortfolioRoute(globalScope) {
    'use strict';

    const documentRef = globalScope.document;
    const mode = documentRef.body?.dataset.routeMode || 'gui';

    if (mode === 'entry') {
        globalScope.sessionStorage.removeItem('intro_done');
        globalScope.sessionStorage.removeItem('portfolio_mode');
    } else {
        globalScope.sessionStorage.setItem('intro_done', '1');
        globalScope.sessionStorage.setItem('portfolio_mode', mode === 'cli' ? 'cli' : 'gui');
    }

    globalScope.location.replace('../' + globalScope.location.search + globalScope.location.hash);
})(window);
