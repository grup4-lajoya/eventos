// service-worker.js

const CACHE_NAME = 'reservas-v1.0.2';
const ASSETS_TO_CACHE = [
    '/eventos/',
    '/eventos/index.html',
    '/eventos/registro.html',
    '/eventos/js/config.js',
    '/eventos/js/auth.js',
    '/eventos/js/app.js',
    '/eventos/manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Instalando...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Cacheando assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker: Activado');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Estrategia de fetch: Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
    // Solo cachear requests GET
    if (event.request.method !== 'GET') {
        return;
    }

    // No cachear llamadas a API/Edge Functions
    if (event.request.url.includes('/functions/')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clonar la respuesta
                const responseClone = response.clone();
                
                // Guardar en cache
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                
                return response;
            })
            .catch(() => {
                // Si falla el network, buscar en cache
                return caches.match(event.request).then((response) => {
                    if (response) {
                        return response;
                    }
                    
                    // Si no está en cache, mostrar página offline
                    if (event.request.destination === 'document') {
                        return caches.match('/index.html');
                    }
                });
            })
    );
});

// Sincronización en background (opcional)
self.addEventListener('sync', (event) => {
    console.log('🔄 Service Worker: Sincronización en background');
    
    if (event.tag === 'sync-data') {
        event.waitUntil(
            // Aquí puedes sincronizar datos pendientes
            Promise.resolve()
        );
    }
});

// Notificaciones Push (opcional para futuro)
self.addEventListener('push', (event) => {
    console.log('🔔 Service Worker: Push recibido');
    
    const options = {
        body: event.data ? event.data.text() : 'Nueva notificación',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-72x72.png',
        vibrate: [200, 100, 200]
    };
    
    event.waitUntil(
        self.registration.showNotification('Sistema de Reservas', options)
    );
});
