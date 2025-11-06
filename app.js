// js/app.js

class App {
    constructor() {
        this.initialized = false;
    }

    // Inicializar app
    async init() {
        if (this.initialized) return;

        console.log(`🚀 Inicializando ${CONFIG.APP_NAME} v${CONFIG.APP_VERSION}`);

        // Verificar si estamos en página de registro
        if (auth.isOnRegistrationPage()) {
            auth.redirectIfAuthenticated();
            this.initRegistroPage();
        } else {
            // Proteger página y validar token
            const isValid = await auth.protectPage();
            
            if (isValid) {
                this.initMainApp();
            }
        }

        this.initialized = true;
    }

    // Inicializar página de registro
    initRegistroPage() {
        console.log('📝 Inicializando página de registro');
        // La lógica del formulario ya está en registro.html
        // Aquí podríamos agregar funcionalidades adicionales
    }

    // Inicializar app principal
    initMainApp() {
        console.log('🏠 Inicializando app principal');

        // Mostrar datos del usuario
        this.displayUserInfo();

        // Iniciar validación periódica
        auth.startPeriodicValidation();

        // Setup event listeners
        this.setupEventListeners();

        // Registrar Service Worker para PWA
        this.registerServiceWorker();
    }

    // Mostrar información del usuario
    displayUserInfo() {
        const userData = auth.getUserData();
        if (!userData) return;

        console.log('👤 Usuario:', userData);

        // Actualizar UI con nombre del usuario
        const userNameElements = document.querySelectorAll('[data-user-name]');
        userNameElements.forEach(el => {
            el.textContent = userData.nombre || userData.usuario?.nombre || 'Usuario';
        });

        // Mostrar tipo de acceso
        const tipoAccesoElements = document.querySelectorAll('[data-tipo-acceso]');
        tipoAccesoElements.forEach(el => {
            const badge = userData.tipo_acceso === 'local' ? 
                '🏠 Personal Local' : 
                '🎫 Visitante';
            el.textContent = badge;
        });

        // Si es visitante, mostrar info del evento
        if (userData.tipo_acceso === 'visitante' && userData.evento_nombre) {
            const eventoElements = document.querySelectorAll('[data-evento-info]');
            eventoElements.forEach(el => {
                el.textContent = `📅 ${userData.evento_nombre}`;
                el.style.display = 'block';
            });
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Botón cerrar sesión
        const logoutBtns = document.querySelectorAll('[data-logout]');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        });

        // Detectar cuando la app vuelve a primer plano
        document.addEventListener('visibilitychange', async () => {
            if (!document.hidden) {
                console.log('👁️ App visible, validando sesión...');
                const validation = await auth.validateToken();
                if (!validation.valid) {
                    auth.hardLogout();
                }
            }
        });
    }

    // Manejar cierre de sesión
    handleLogout() {
        const confirmLogout = confirm('¿Desea cerrar sesión?');
        if (confirmLogout) {
            auth.softLogout(); // Cambiar a hardLogout() si quieres borrar el token
        }
    }

    // Registrar Service Worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('✅ Service Worker registrado:', registration.scope);
            } catch (error) {
                console.error('❌ Error registrando Service Worker:', error);
            }
        }
    }
}

// Instancia global
const app = new App();

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}
