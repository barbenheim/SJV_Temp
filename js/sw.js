const CACHE_NAME = 'sjv-cache-v1';
const assets = ['./', './index.html', './js/main.js', './js/map.js', './css/style.css'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(assets))));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));