const APP_VERSION = '1.0.0'; // ← Incrementar en cada actualización
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

function verificarActualizacion() {
    const versionGuardada = localStorage.getItem(VERSION_KEY);
    
    if (!versionGuardada) {
        localStorage.setItem(VERSION_KEY, APP_VERSION);
        console.log('✅ Primera instalación - Versión:', APP_VERSION);
        return;
    }
    
    if (versionGuardada !== APP_VERSION) {
        console.log('🔄 Nueva versión detectada:', versionGuardada, '→', APP_VERSION);
        mostrarNotificacionActualizacion();
    }
}

function mostrarNotificacionActualizacion() {
    const notificacion = document.createElement('div');
    notificacion.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 20px 30px;
            border-radius: 15px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 90%;
            animation: slideDown 0.5s ease;
        ">
            <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
                <div style="font-size: 18px; font-weight: 600; color: #2B4C7E; margin-bottom: 8px;">
                    Nueva versión disponible
                </div>
                <div style="font-size: 14px; color: #666; margin-bottom: 20px;">
                    Actualiza para obtener las últimas mejoras
                </div>
                <button onclick="actualizarApp()" style="
                    background: linear-gradient(135deg, #2B4C7E 0%, #3D5A80 100%);
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 25px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 14px;
                ">
                    Actualizar ahora
                </button>
            </div>
        </div>
        <style>
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
        </style>
    `;
    
    document.body.appendChild(notificacion);
}

function actualizarApp() {
    console.log('🔄 Iniciando actualización...');
    
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
    
    // Limpiar solo caches
    if ('serviceWorker' in navigator) {
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    console.log('🗑️ Eliminando cache:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            console.log('✅ Caches limpiados');
            
            // Restaurar datos protegidos
            Object.keys(datosProtegidos).forEach(key => {
                localStorage.setItem(key, datosProtegidos[key]);
            });
            
            console.log('✅ Datos restaurados');
            
            setTimeout(() => {
                window.location.reload(true);
            }, 500);
        });
    } else {
        window.location.reload(true);
    }
}

window.addEventListener('load', verificarActualizacion);
