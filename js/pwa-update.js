const APP_VERSION = '2.0.1';
const VERSION_KEY = 'app-version';

function verificarActualizacion() {
    const versionGuardada = localStorage.getItem(VERSION_KEY);
    
    if (!versionGuardada) {
        localStorage.setItem(VERSION_KEY, APP_VERSION);
        return;
    }
    
    if (versionGuardada !== APP_VERSION) {
        // Nueva versión detectada
        mostrarNotificacionActualizacion();
    }
}
function mostrarNotificacionActualizacion() {
    const notificacion = document.createElement('div');
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
                            Hay una nueva versión del sistema con mejoras y correcciones
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
                
                <button onclick="actualizarAhora()" style="
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
}

function actualizarAhora() {
    localStorage.setItem(VERSION_KEY, APP_VERSION);
    
    // Limpiar todos los caches
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
        });
    }
    
    // Actualizar service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(reg => reg.update());
        });
    }
    
    setTimeout(() => {
        window.location.reload(true);
    }, 500);
}

window.addEventListener('load', verificarActualizacion);

// Limpiar service workers antiguos al cargar
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
            console.log('🔄 Actualizando service worker...');
            registration.update();
        });
    });
}
