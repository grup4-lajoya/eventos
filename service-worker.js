// service-worker.js - VERSIÓN CORREGIDA
const CACHE_VERSION = '2.2.5';
const CACHE_NAME = `reservas-v${CACHE_VERSION}-${Date.now()}`;
const ASSETS_TO_CACHE = [
    '/eventos/',
    '/eventos/index.html',
    '/eventos/login.html',
    '/eventos/registro.html',
    '/eventos/reservas.html',
    '/eventos/mis-qr.html',
    '/eventos/terminal-rancho.html',
    '/eventos/js/config.js',
    '/eventos/js/auth.js',
    '/eventos/js/pwa-install.js',
    '/eventos/js/pwa-update.js',
    '/eventos/manifest.json'
];

// Instalación
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker v2.0.1: Instalando...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Cacheando assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activación
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker v2.0.1: Activado');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => {
                        console.log('🗑️ Eliminando cache antiguo:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch - CRÍTICO: NO interceptar Supabase
self.addEventListener('fetch', (event) => {
    const url = event.request.url;
    
    // ✅ NO CACHEAR - Dejar pasar directamente:
    // 1. Supabase (Edge Functions y REST API)
    // 2. Métodos POST, PUT, DELETE
    // 3. Requests con credenciales
    if (url.includes('supabase.co') ||
        url.includes('pwa-update.js') ||
        event.request.method !== 'GET') {
        return; // ← Dejar pasar SIN interceptar
    }
    
    // ✅ SOLO cachear archivos estáticos locales
    if (url.includes('/eventos/')) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        return response; // Devolver del cache
                    }
                    
                    return fetch(event.request).then(response => {
                        // Solo cachear respuestas exitosas
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                        
                        return response;
                    });
                })
        );
    }
    self.addEventListener('message', (event) => {
        console.log('📩 SW recibió mensaje:', event.data);
        
        if (event.data && event.data.type === 'SKIP_WAITING') {
            console.log('⚡ Ejecutando skipWaiting()');
            self.skipWaiting();
        }
});
