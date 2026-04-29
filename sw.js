// =============================================================================
// sw.js — Service Worker for the docs site.
//
// Caches the heavy video assets so navigating between pages does not refetch
// them. Strategy: cache-first for anything under assets/videos/, network for
// everything else. Range requests (which the <video> element issues for
// partial seeking) are served from the cached full response.
// =============================================================================

const VIDEO_CACHE = "addverb-docs-videos-v1";
const VIDEO_PATH_RE = /\/assets\/videos\//;

self.addEventListener("install", (event) => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((k) => k.startsWith("addverb-docs-videos-") && k !== VIDEO_CACHE)
                    .map((k) => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

async function sliceRange(response, rangeHeader) {
    const buf = await response.arrayBuffer();
    const total = buf.byteLength;
    const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader || "");
    let start = 0;
    let end = total - 1;
    if (match) {
        if (match[1]) start = parseInt(match[1], 10);
        if (match[2]) end = parseInt(match[2], 10);
    }
    if (isNaN(start) || start < 0) start = 0;
    if (isNaN(end) || end >= total) end = total - 1;
    const sliced = buf.slice(start, end + 1);
    const headers = new Headers(response.headers);
    headers.set("Content-Range", `bytes ${start}-${end}/${total}`);
    headers.set("Content-Length", String(end - start + 1));
    headers.set("Accept-Ranges", "bytes");
    return new Response(sliced, { status: 206, statusText: "Partial Content", headers });
}

self.addEventListener("fetch", (event) => {
    const req = event.request;
    if (req.method !== "GET") return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;
    if (!VIDEO_PATH_RE.test(url.pathname)) return;

    event.respondWith((async () => {
        const cache = await caches.open(VIDEO_CACHE);
        const cacheKey = new Request(url.pathname, { method: "GET" });
        const cached = await cache.match(cacheKey);
        const rangeHeader = req.headers.get("range");

        if (cached) {
            if (rangeHeader) return sliceRange(cached.clone(), rangeHeader);
            return cached.clone();
        }

        // Fetch the full resource (without Range) so we can cache it once.
        try {
            const fullResp = await fetch(url.pathname, { credentials: "same-origin" });
            if (fullResp && fullResp.ok && fullResp.status === 200) {
                cache.put(cacheKey, fullResp.clone()).catch(() => {});
                if (rangeHeader) return sliceRange(fullResp.clone(), rangeHeader);
                return fullResp;
            }
            // If the full fetch failed, fall back to a plain network fetch of the original request.
            return fetch(req);
        } catch (e) {
            return fetch(req);
        }
    })());
});
