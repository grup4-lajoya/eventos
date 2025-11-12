// DESREGISTRAR SERVICE WORKER ANTIGUO
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Forzando instalación limpia');
    self.skipWaiting(); // ← Forzar activación inmediata
});

self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker: Limpieza total');
    
    event.waitUntil(
        // BORRAR TODOS LOS CACHES SIN EXCEPCIÓN
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    console.log('🗑️ Eliminando cache:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            console.log('🔄 Tomando control de todos los clientes');
            return self.clients.claim(); // ← Tomar control inmediato
        })
    );
});
const CACHE_NAME = 'reservas-v2.0.0';
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

// ✅ USAR ESTA ESTRATEGIA (Network First):
self.addEventListener('fetch', (event) => {
    // Solo cachear requests GET
    if (event.request.method !== 'GET') {
        return;
    }
    
    // NO cachear llamadas a API/Edge Functions
    if (event.request.url.includes('/functions/') || 
        event.request.url.includes('supabase.co/rest/')) {
        return; // ← Dejar pasar sin cachear
    }

    event.respondWith(
        // SIEMPRE intentar red primero
        fetch(event.request)
            .then((response) => {
                // Solo cachear respuestas exitosas
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                
                return response;
            })
            .catch(() => {
                // Si falla la red, buscar en cache
                return caches.match(event.request);
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
