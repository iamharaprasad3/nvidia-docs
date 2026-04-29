// =============================================================================
// video-persist.js
//
// Keep <video> elements alive across mkdocs-material's instant-navigation page
// swaps. On each swap the new HTML brings a brand-new <video> tag, which the
// browser would otherwise re-decode and restart from frame 0. We hold a JS
// reference to each video keyed by its source pathname; when a fresh tag lands
// in the DOM, we replace it with the cached element (which already has its
// buffer + currentTime) so playback continues seamlessly.
// =============================================================================

(function () {
    const VIDEO_PATH_RE = /\/assets\/videos\//;
    const cache = new Map(); // pathname -> HTMLVideoElement

    function keyFor(video) {
        const src = (video.querySelector("source") && video.querySelector("source").src) || video.src;
        if (!src) return null;
        try {
            const u = new URL(src, location.href);
            return VIDEO_PATH_RE.test(u.pathname) ? u.pathname : null;
        } catch (e) {
            return null;
        }
    }

    function adopt(fresh) {
        if (!(fresh instanceof HTMLVideoElement)) return;
        if (fresh.dataset.persisted === "1") return;

        const key = keyFor(fresh);
        if (!key) return;

        const cached = cache.get(key);
        if (!cached) {
            // First time we see this URL — claim ownership of this element.
            fresh.dataset.persisted = "1";
            cache.set(key, fresh);
            return;
        }
        if (cached === fresh) return;

        // Cancel the fresh element's in-flight load so the network request
        // is released, then graft the cached element into its place.
        try {
            fresh.pause();
            fresh.querySelectorAll("source").forEach(s => s.removeAttribute("src"));
            fresh.removeAttribute("src");
            fresh.load();
        } catch (e) { /* ignore */ }

        const parent = fresh.parentNode;
        if (parent) parent.replaceChild(cached, fresh);

        if (cached.paused && cached.autoplay) {
            const p = cached.play();
            if (p && typeof p.catch === "function") p.catch(() => {});
        }
    }

    function sweep(root) {
        const scope = root || document;
        if (!scope.querySelectorAll) return;
        scope.querySelectorAll("video").forEach(adopt);
    }

    // Pick up brand-new <video> tags the moment they land in the DOM (this is
    // the path that fires on Material's instant-nav swap, before paint).
    const mo = new MutationObserver(muts => {
        for (const m of muts) {
            for (const n of m.addedNodes) {
                if (n.nodeType !== 1) continue;
                if (n.tagName === "VIDEO") adopt(n);
                else sweep(n);
            }
        }
    });

    function start() {
        sweep(document);
        if (document.body) {
            mo.observe(document.body, { childList: true, subtree: true });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }

    // Belt-and-braces: also sweep on every Material page-render tick.
    if (typeof document$ !== "undefined" && document$.subscribe) {
        document$.subscribe(() => sweep(document));
    }
})();
