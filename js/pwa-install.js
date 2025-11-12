let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    console.log('📱 PWA: Evento beforeinstallprompt disparado');
    e.preventDefault();
    deferredPrompt = e;
    mostrarBannerInstalacion();
});

function mostrarBannerInstalacion() {
    // Verificar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('✅ App ya instalada');
        return;
    }
    
    // Verificar si ya rechazó
    const yaRechazado = localStorage.getItem('pwa-install-rejected');
    if (yaRechazado) {
        const fechaRechazo = new Date(yaRechazado);
        const ahora = new Date();
        const diasPasados = (ahora - fechaRechazo) / (1000 * 60 * 60 * 24);
        
        if (diasPasados < 7) {
            console.log('⏳ Usuario rechazó instalación hace menos de 7 días');
            return;
        }
    }
    
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = `
        <div style="
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #2B4C7E 0%, #3D5A80 100%);
            color: white;
            padding: 15px 20px;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideUp 0.5s ease;
        ">
            <div style="display: flex; align-items: center; gap: 15px; max-width: 600px; margin: 0 auto;">
                <div style="font-size: 32px;">📱</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 15px; margin-bottom: 4px;">
                        Instalar Sistema de Reservas
                    </div>
                    <div style="font-size: 13px; opacity: 0.9;">
                        Acceso rápido desde tu pantalla de inicio
                    </div>
                </div>
                <button id="pwa-install-btn" style="
                    background: white;
                    color: #2B4C7E;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                ">
                    Instalar
                </button>
                <button id="pwa-install-close" style="
                    background: transparent;
                    color: white;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 5px;
                ">
                    ✕
                </button>
            </div>
        </div>
        <style>
            @keyframes slideUp {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }
        </style>
    `;
    
    document.body.appendChild(banner);
    
    document.getElementById('pwa-install-btn').addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`📱 Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);
        
        if (outcome === 'dismissed') {
            localStorage.setItem('pwa-install-rejected', new Date().toISOString());
        }
        
        deferredPrompt = null;
        banner.remove();
    });
    
    document.getElementById('pwa-install-close').addEventListener('click', () => {
        localStorage.setItem('pwa-install-rejected', new Date().toISOString());
        banner.remove();
    });
}

window.addEventListener('appinstalled', () => {
    console.log('✅ PWA instalada exitosamente');
    localStorage.removeItem('pwa-install-rejected');
});
