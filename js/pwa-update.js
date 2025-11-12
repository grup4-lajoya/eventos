const APP_VERSION = '1.0.1'; // ← Incrementar esto
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
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 20px 30px;
            border-radius: 15px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 90%;
            text-align: center;
        ">
            <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
            <div style="font-size: 18px; font-weight: 600; color: #2B4C7E; margin-bottom: 8px;">
                Nueva versión disponible
            </div>
            <button onclick="actualizarAhora()" style="
                background: linear-gradient(135deg, #2B4C7E 0%, #3D5A80 100%);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
            ">
                Actualizar ahora
            </button>
        </div>
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
