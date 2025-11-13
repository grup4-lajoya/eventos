// pwa-update.js - VERSIÓN MEJORADA
const APP_VERSION = '2.1.4'; // ← Cambiar en cada actualización
const VERSION_KEY = 'app-version';

const PROTECTED_KEYS = [
    'device_fingerprint',
    'fingerprint_date',
    'token_acceso',
    'usuario_id',
    'tipo_usuario',
    'tipo_acceso',
    'nombre_usuario',
    'evento_id',
    'evento_nombre',
    'evento_fecha_fin',
    'usuario_data',
    'unidad',
    'pwa-install-rejected'
];

// Variables globales
let swRegistration = null;
let updatePending = false;

// Inicializar al cargar
window.addEventListener('load', () => {
    verificarActualizacion();
    registrarServiceWorker();
});

function verificarActualizacion() {
    const versionGuardada = localStorage.getItem(VERSION_KEY);
    
    console.log('📱 Versión actual:', APP_VERSION);
    console.log('💾 Versión guardada:', versionGuardada);
    
    if (!versionGuardada) {
        console.log('✅ Primera instalación');
        localStorage.setItem(VERSION_KEY, APP_VERSION);
        return;
    }
    
    if (versionGuardada !== APP_VERSION) {
        console.log('🔄 Nueva versión detectada:', versionGuardada, '→', APP_VERSION);
        mostrarNotificacionActualizacion();
    }
}
function registrarServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        console.log('⚠️ Service Worker no soportado');
        return;
    }

    navigator.serviceWorker.register('/eventos/service-worker.js')
        .then(registration => {
            swRegistration = registration;
            console.log('✅ Service Worker registrado');

            // ✅ FORZAR actualización inmediata al cargar
            registration.update().then(() => {
                console.log('🔍 Update forzado al cargar');
            });

            // Verificar actualizaciones cada 30 segundos (reducir de 60)
            setInterval(() => {
                console.log('🔍 Verificando actualizaciones...');
                registration.update();
            }, 30000); // ← Cambiar a 30 segundos

            // Detectar cuando hay una nueva versión instalándose
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('📦 Nueva versión del SW encontrada');

                newWorker.addEventListener('statechange', () => {
                    console.log('🔄 SW State:', newWorker.state);
                    
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('🎉 Nueva versión instalada y lista');
                        updatePending = true;
                        
                        // ✅ Verificar versión de localStorage también
                        verificarActualizacion();
                    }
                });
            });
        })
        .catch(err => {
            console.error('❌ Error registrando Service Worker:', err);
        });

    // Detectar cuando el SW toma control (después de actualización)
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            console.log('🔄 Service Worker tomó control, recargando...');
            refreshing = true;
            window.location.reload();
        }
    });
}

function mostrarNotificacionActualizacion() {
    // Evitar duplicados
    if (document.getElementById('update-notification')) {
        return;
    }

    const notificacion = document.createElement('div');
    notificacion.id = 'update-notification';
    notificacion.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
            padding: 20px;
        ">
            <div style="
                background: white;
                padding: 30px;
                border-radius: 20px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                max-width: 500px;
                width: 100%;
                animation: slideUp 0.4s ease;
            ">
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 20px;
                ">
                    <div style="
                        width: 60px;
                        height: 60px;
                        background: linear-gradient(135deg, #2B4C7E 0%, #3D5A80 100%);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 28px;
                        flex-shrink: 0;
                    ">
                        🔄
                    </div>
                    <div style="flex: 1;">
                        <div style="
                            font-size: 20px;
                            font-weight: 700;
                            color: #2B4C7E;
                            margin-bottom: 5px;
                        ">
                            Actualización Disponible
                        </div>
                        <div style="
                            font-size: 14px;
                            color: #666;
                            line-height: 1.5;
                        ">
                            Hay una nueva versión del sistema
                        </div>
                    </div>
                </div>
                
                <div style="
                    background: #E8EAF6;
                    padding: 15px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                ">
                    <div style="
                        font-size: 13px;
                        color: #2B4C7E;
                        font-weight: 600;
                        margin-bottom: 8px;
                    ">
                        ✓ Mejoras incluidas:
                    </div>
                    <ul style="
                        margin: 0;
                        padding-left: 20px;
                        color: #555;
                        font-size: 13px;
                        line-height: 1.8;
                    ">
                        <li>Correcciones de errores</li>
                        <li>Mejoras de rendimiento</li>
                        <li>Nuevas funcionalidades</li>
                    </ul>
                </div>
                
                <button id="btnActualizarAhora" style="
                    width: 100%;
                    background: linear-gradient(135deg, #2B4C7E 0%, #3D5A80 100%);
                    color: white;
                    border: none;
                    padding: 15px;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 15px;
                    transition: transform 0.2s;
                ">
                    Actualizar Ahora
                </button>
                
                <div style="
                    text-align: center;
                    margin-top: 15px;
                    font-size: 12px;
                    color: #999;
                ">
                    La actualización tomará solo unos segundos
                </div>
            </div>
        </div>
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        </style>
    `;
    
    document.body.appendChild(notificacion);
    
    // Evento click en botón
    document.getElementById('btnActualizarAhora').addEventListener('click', actualizarAhora);
}

function actualizarAhora() {
    console.log('🔄 Iniciando actualización...');
    
    const btn = document.getElementById('btnActualizarAhora');
    btn.disabled = true;
    btn.textContent = '⏳ Actualizando...';
    
    // Guardar datos protegidos
    const datosProtegidos = {};
    PROTECTED_KEYS.forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) {
            datosProtegidos[key] = value;
        }
    });
    
    console.log('💾 Datos protegidos:', Object.keys(datosProtegidos));
    
    // Actualizar versión
    localStorage.setItem(VERSION_KEY, APP_VERSION);
    
    // Si hay SW pendiente, activarlo
    if (updatePending && swRegistration && swRegistration.waiting) {
        console.log('📤 Enviando mensaje SKIP_WAITING al SW');
        swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    
    // Limpiar caches antiguos
    if ('caches' in window) {
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== 'reservas-v2.0.1') // No borrar cache actual
                    .map(name => {
                        console.log('🗑️ Eliminando cache antiguo:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => {
            console.log('✅ Caches antiguos limpiados');
            
            // Restaurar datos protegidos
            Object.keys(datosProtegidos).forEach(key => {
                localStorage.setItem(key, datosProtegidos[key]);
            });
            
            console.log('✅ Datos restaurados');
            console.log('🔄 Recargando aplicación...');
            
            setTimeout(() => {
                window.location.reload(true);
            }, 500);
        });
    } else {
        // Si no hay caches API, solo recargar
        setTimeout(() => {
            window.location.reload(true);
        }, 500);
    }
}
