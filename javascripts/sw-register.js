// =============================================================================
// sw-register.js — registers the docs Service Worker that caches video assets
// so navigating between pages does not refetch them.
// =============================================================================

(function () {
    if (!("serviceWorker" in navigator)) return;
    // Register at site root scope so it can intercept assets/videos/* on every page.
    const swUrl = (document.querySelector('base')?.href || (location.origin + '/')) + 'sw.js';
    window.addEventListener("load", function () {
        navigator.serviceWorker.register(swUrl, { scope: "./" }).catch(function () {
            // ignore — file:// or unsupported context
        });
    });
})();
