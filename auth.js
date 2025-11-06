// js/auth.js

class AuthGuard {
    constructor() {
        this.validationInterval = null;
    }

    // Verificar si hay token guardado
    hasToken() {
        return !!localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    }

    // Obtener token
    getToken() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    }

    // Obtener datos del usuario
    getUserData() {
        const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USUARIO_DATA);
        return userData ? JSON.parse(userData) : null;
    }

    // Guardar datos del usuario después del registro
    saveUserData(data) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, data.token_acceso);
        localStorage.setItem(CONFIG.STORAGE_KEYS.USUARIO_ID, data.usuario_id);
        localStorage.setItem(CONFIG.STORAGE_KEYS.TIPO_USUARIO, data.tipo_usuario);
        localStorage.setItem(CONFIG.STORAGE_KEYS.TIPO_ACCESO, data.tipo_acceso);
        localStorage.setItem(CONFIG.STORAGE_KEYS.NOMBRE, data.nombre);

        // Guardar datos completos en JSON
        localStorage.setItem(CONFIG.STORAGE_KEYS.USUARIO_DATA, JSON.stringify(data));

        // Si es visitante, guardar datos del evento
        if (data.tipo_acceso === 'visitante' && data.evento_id) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.EVENTO_ID, data.evento_id);
            localStorage.setItem(CONFIG.STORAGE_KEYS.EVENTO_NOMBRE, data.evento_nombre || '');
            localStorage.setItem(CONFIG.STORAGE_KEYS.EVENTO_FECHA_FIN, data.evento_fecha_fin || '');
        }
    }

    // Limpiar sesión
    clearSession() {
        Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        this.stopValidation();
    }

    // Cerrar sesión (solo visual, mantiene token)
    softLogout() {
        console.log('🔓 Sesión cerrada (visual)');
        // No limpiamos el localStorage, solo redirigimos
        window.location.href = CONFIG.ROUTES.REGISTRO;
    }

    // Cerrar sesión real (elimina token)
    hardLogout() {
        console.log('🔒 Sesión cerrada (real)');
        this.clearSession();
        window.location.href = CONFIG.ROUTES.REGISTRO;
    }

    // Validar token contra el servidor
    async validateToken() {
        const token = this.getToken();

        if (!token) {
            console.log('❌ No hay token');
            return { valid: false, error: 'No hay token' };
        }

        try {
            const response = await fetch(CONFIG.getEndpointURL('VALIDAR_TOKEN'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': CONFIG.SUPABASE_ANON_KEY
                },
                body: JSON.stringify({ token_acceso: token })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                console.log('❌ Token inválido:', result.error);
                return { 
                    valid: false, 
                    error: result.error,
                    codigo: result.codigo 
                };
            }

            console.log('✅ Token válido');

            // Actualizar datos del usuario
            if (result.data) {
                const currentData = this.getUserData();
                const updatedData = { ...currentData, ...result.data };
                localStorage.setItem(CONFIG.STORAGE_KEYS.USUARIO_DATA, JSON.stringify(updatedData));
            }

            return { valid: true, data: result.data };

        } catch (error) {
            console.error('❌ Error validando token:', error);
            return { valid: false, error: error.message };
        }
    }

    // Proteger página (usar en páginas que requieren autenticación)
    async protectPage() {
        console.log('🔍 Validando acceso a la página...');

        // Si no hay token, redirigir a registro
        if (!this.hasToken()) {
            console.log('❌ No autenticado, redirigiendo a registro');
            window.location.href = CONFIG.ROUTES.REGISTRO;
            return false;
        }

        // Validar token contra el servidor
        const validation = await this.validateToken();

        if (!validation.valid) {
            // Manejar errores específicos
            if (validation.codigo === 'EVENTO_FINALIZADO' || 
                validation.codigo === 'USUARIO_DESACTIVADO') {
                alert(`Acceso denegado: ${validation.error}`);
            }

            if (CONFIG.VALIDATION.AUTO_LOGOUT_ON_ERROR) {
                this.clearSession();
            }
            
            window.location.href = CONFIG.ROUTES.REGISTRO;
            return false;
        }

        console.log('✅ Acceso permitido');
        return true;
    }

    // Iniciar validación periódica
    startPeriodicValidation() {
        if (this.validationInterval) return;

        console.log('⏰ Iniciando validación periódica cada', CONFIG.VALIDATION.TOKEN_CHECK_INTERVAL / 1000, 'segundos');

        this.validationInterval = setInterval(async () => {
            console.log('🔄 Validación periódica...');
            const validation = await this.validateToken();

            if (!validation.valid) {
                console.log('❌ Token expirado o inválido, cerrando sesión');
                clearInterval(this.validationInterval);
                this.hardLogout();
            }
        }, CONFIG.VALIDATION.TOKEN_CHECK_INTERVAL);
    }

    // Detener validación periódica
    stopValidation() {
        if (this.validationInterval) {
            clearInterval(this.validationInterval);
            this.validationInterval = null;
        }
    }

    // Verificar si ya está en página de registro
    isOnRegistrationPage() {
        return window.location.pathname.includes(CONFIG.ROUTES.REGISTRO);
    }

    // Redirigir si ya está autenticado (para página de registro)
    redirectIfAuthenticated() {
        if (this.hasToken() && this.isOnRegistrationPage()) {
            console.log('✅ Ya autenticado, redirigiendo a home');
            window.location.href = CONFIG.ROUTES.HOME;
        }
    }
}

// Instancia global
const auth = new AuthGuard();
