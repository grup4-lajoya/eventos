// js/config.js
const CONFIG = {
    // Supabase
    SUPABASE_URL: 'https://tu-proyecto.supabase.co',
    SUPABASE_ANON_KEY: 'tu-anon-key-aqui',
    
    // Edge Functions
    ENDPOINTS: {
        REGISTRO: '/functions/v1/registro-usuario-qr',
        VALIDAR_TOKEN: '/functions/v1/validar-token-acceso'
    },
    
    // Rutas de la app
    ROUTES: {
        REGISTRO: 'registro.html',
        HOME: 'index.html',
        RESERVAS: 'reservas.html' // Próximamente
    },
    
    // LocalStorage keys
    STORAGE_KEYS: {
        TOKEN: 'token_acceso',
        USUARIO_ID: 'usuario_id',
        TIPO_USUARIO: 'tipo_usuario',
        TIPO_ACCESO: 'tipo_acceso',
        NOMBRE: 'nombre_usuario',
        EVENTO_ID: 'evento_id',
        EVENTO_NOMBRE: 'evento_nombre',
        EVENTO_FECHA_FIN: 'evento_fecha_fin',
        USUARIO_DATA: 'usuario_data' // JSON completo
    },
    
    // Configuración de validación
    VALIDATION: {
        TOKEN_CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutos
        AUTO_LOGOUT_ON_ERROR: true
    },
    
    // PWA
    APP_NAME: 'Sistema de Reservas',
    APP_VERSION: '1.0.0'
};

// Helper para construir URLs
CONFIG.getEndpointURL = function(endpoint) {
    return `${this.SUPABASE_URL}${this.ENDPOINTS[endpoint]}`;
};

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
