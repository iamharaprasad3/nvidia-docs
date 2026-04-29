// =============================================================================
// sw-register.js — registers the docs Service Worker that caches video assets
// so navigating between pages does not refetch them.
// =============================================================================

(function () {
    if (!("serviceWorker" in navigator)) return;
    // The SW lives at site root (sw.js). Resolving against the <base> tag (or
    // the document) gives us its absolute URL. Scope is omitted so it defaults
    // to the SW's own directory — which is the site root — letting it
    // intercept /assets/videos/* from every page.
    const baseHref = (document.querySelector("base") && document.querySelector("base").href) ||
                     (location.origin + "/");
    const swUrl = new URL("sw.js", baseHref).href;
    window.addEventListener("load", function () {
        navigator.serviceWorker.register(swUrl).catch(function () {
            // ignore — file:// or unsupported context
        });
    });
})();
