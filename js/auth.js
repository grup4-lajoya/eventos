// js/auth.js

class AuthGuard {
    constructor() {
        this.validationInterval = null;
        this.isValidating = false; // Prevenir validaciones simultáneas
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

    // Cerrar sesión real (elimina token pero mantiene fingerprint)
    hardLogout() {
        console.log('🔒 Sesión cerrada (real)');
        const fingerprint = localStorage.getItem('device_fingerprint');
        this.clearSession();
        if (fingerprint) {
            localStorage.setItem('device_fingerprint', fingerprint);
        }
        window.location.href = CONFIG.ROUTES.LOGIN;
    }

    // ✅ Helper para esperar un tiempo (usado en retry)
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ✅ Validar token contra el servidor con retry y exponential backoff
    async validateToken(retryCount = 0) {
        const token = this.getToken();

        if (!token) {
            console.log('❌ No hay token');
            return { valid: false, error: 'No hay token' };
        }

        // ✅ Prevenir validaciones simultáneas
        if (this.isValidating) {
            console.log('⏳ Ya hay una validación en curso, esperando...');
            return { valid: true, cached: true };
        }

        this.isValidating = true;

        try {
            const response = await fetch(CONFIG.getEndpointURL('VALIDAR_TOKEN'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': CONFIG.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({ token_acceso: token })
            });

            // ✅ Manejar rate limiting (429) con exponential backoff
            if (response.status === 429) {
                this.isValidating = false;
                
                if (retryCount < CONFIG.VALIDATION.MAX_RETRY_ATTEMPTS) {
                    // Backoff exponencial: 2^n segundos + jitter aleatorio
                    const baseDelay = Math.pow(2, retryCount) * 1000;
                    const jitter = Math.random() * 1000;
                    const delay = baseDelay + jitter;
                    
                    console.log(`⏳ Rate limit (429), reintentando en ${Math.round(delay/1000)}s... (intento ${retryCount + 1}/${CONFIG.VALIDATION.MAX_RETRY_ATTEMPTS})`);
                    
                    await this.sleep(delay);
                    return this.validateToken(retryCount + 1);
                } else {
                    console.log('❌ Rate limit: máximo de reintentos alcanzado');
                    // No cerrar sesión por rate limit, solo informar
                    return { 
                        valid: true, // Asumir válido temporalmente
                        warning: 'Servicio temporalmente saturado',
                        rateLimited: true 
                    };
                }
            }

            // ✅ Manejar errores 5xx (servidor)
            if (response.status >= 500) {
                this.isValidating = false;
                console.log('❌ Error del servidor (5xx)');
                
                if (retryCount < CONFIG.VALIDATION.MAX_RETRY_ATTEMPTS) {
                    const delay = 2000 + Math.random() * 1000; // 2-3 segundos
                    console.log(`⏳ Error de servidor, reintentando en ${Math.round(delay/1000)}s...`);
                    await this.sleep(delay);
                    return this.validateToken(retryCount + 1);
                }
                
                return { valid: true, warning: 'Error de servidor', serverError: true };
            }

            const result = await response.json();

            if (!response.ok || !result.success) {
                console.log('❌ Token inválido:', result.error);
                this.isValidating = false;
                return { 
                    valid: false, 
                    error: result.error,
                    codigo: result.codigo 
                };
            }

            console.log('✅ Token válido');

            // ✅ Guardar timestamp de última validación exitosa
            localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_VALIDATION, Date.now().toString());

            // Actualizar datos del usuario
            if (result.data) {
                const currentData = this.getUserData();
                const updatedData = { ...currentData, ...result.data };
                localStorage.setItem(CONFIG.STORAGE_KEYS.USUARIO_DATA, JSON.stringify(updatedData));
            }

            this.isValidating = false;
            return { valid: true, data: result.data };

        } catch (error) {
            console.error('❌ Error validando token:', error);
            this.isValidating = false;
            
            // En caso de error de red, asumir válido temporalmente
            return { valid: true, warning: 'Error de red', networkError: true };
        }
    }

    // ✅ Validar solo si ha pasado suficiente tiempo desde la última validación
    async validateTokenIfNeeded() {
        const lastValidation = parseInt(localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_VALIDATION) || '0');
        const now = Date.now();
        const timeSinceLastValidation = now - lastValidation;

        if (timeSinceLastValidation < CONFIG.VALIDATION.MIN_VALIDATION_INTERVAL) {
            const remainingTime = Math.round((CONFIG.VALIDATION.MIN_VALIDATION_INTERVAL - timeSinceLastValidation) / 60000);
            console.log(`✅ Token validado recientemente (hace ${Math.round(timeSinceLastValidation/60000)} min), omitiendo validación. Próxima en ${remainingTime} min.`);
            return { valid: true, cached: true };
        }

        console.log(`🔄 Validando token (última validación hace ${Math.round(timeSinceLastValidation/60000)} min)...`);
        return await this.validateToken();
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

        // ✅ Validar token solo si es necesario (respeta intervalo mínimo)
        const validation = await this.validateTokenIfNeeded();

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

        // ✅ Mostrar advertencia si hubo rate limit o error
        if (validation.warning) {
            console.warn('⚠️', validation.warning);
        }

        console.log('✅ Acceso permitido');
        return true;
    }

    // ✅ Iniciar validación periódica (DESACTIVADA por defecto)
    startPeriodicValidation() {
        if (!CONFIG.VALIDATION.TOKEN_CHECK_INTERVAL) {
            console.log('✅ Validación periódica desactivada - solo validación on-demand para optimizar recursos');
            console.log('💡 El token se validará automáticamente cuando:');
            console.log('   - El usuario vuelva a la app después de 30+ minutos');
            console.log('   - Se realice una acción crítica (reserva, cancelación, etc.)');
            return;
        }

        if (this.validationInterval) return;

        // Si está habilitado, agregar offset aleatorio para distribuir carga
        const baseInterval = CONFIG.VALIDATION.TOKEN_CHECK_INTERVAL;
        const randomOffset = Math.random() * 10 * 60 * 1000; // 0-10 minutos
        const interval = baseInterval + randomOffset;

        console.log('⏰ Iniciando validación periódica cada', Math.round(interval / 60000), 'minutos');

        this.validationInterval = setInterval(async () => {
            console.log('🔄 Validación periódica programada...');
            const validation = await this.validateToken();

            if (!validation.valid && !validation.rateLimited && !validation.serverError) {
                console.log('❌ Token expirado o inválido, cerrando sesión');
                clearInterval(this.validationInterval);
                this.hardLogout();
            }
        }, interval);
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
