const CACHE_NAME = 'debbie-pro-v48';
const APP_VERSION = '48';

const ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/favicon-32.png',
  '/static/app.js',
  '/static/styles.css',
  '/static/exercises-extra.js',
  '/static/mega-features.js',
  '/manifest.json'
];

// Instalación: cachear assets
self.addEventListener('install', e => {
  console.log('[SW] Instalando v' + APP_VERSION);
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activación: limpiar caches viejos
self.addEventListener('activate', e => {
  console.log('[SW] Activando v' + APP_VERSION);
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Eliminando cache viejo:', k);
          return caches.delete(k);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: SOLO interceptar GET de nuestro dominio
self.addEventListener('fetch', e => {
  // IGNORAR todo lo que NO sea GET (POST, PUT, DELETE, etc.)
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // IGNORAR requests a otros dominios (Firebase, Google APIs, Jitsi, etc.)
  if (url.origin !== self.location.origin) return;

  // version.json SIEMPRE desde red (nunca cache)
  if (url.pathname === '/version.json') {
    e.respondWith(fetch(e.request));
    return;
  }

  // HTML: network-first
  if (e.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Assets propios: cache-first, fallback red
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      });
    }).catch(() => new Response('Offline', { status: 503 }))
  );
});

// Mensaje desde la app para forzar update
self.addEventListener('message', e => {
  if (e.data === 'FORCE_UPDATE') {
    console.log('[SW] Force update recibido');
    caches.keys().then(keys => {
      return Promise.all(keys.map(k => caches.delete(k)));
    }).then(() => {
      self.skipWaiting();
      if (e.source && e.source.postMessage) {
        e.source.postMessage({ type: 'SW_UPDATED', version: APP_VERSION });
      }
    });
  }
});