// js/config.js
const CONFIG = {
    // Supabase
    SUPABASE_URL: 'https://qgbixgvidxeaoxxpyiyw.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnYml4Z3ZpZHhlYW94eHB5aXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTU3NzMsImV4cCI6MjA3NTc3MTc3M30.NQ5n_vFnHDp8eNjV3I9vRujfWDWWGAywgyICpqX0OKQ',
    
    // Edge Functions
    ENDPOINTS: {
        REGISTRO: 'https://qgbixgvidxeaoxxpyiyw.supabase.co/functions/v1/registro-usuario-qr',
        VALIDAR_TOKEN: 'https://qgbixgvidxeaoxxpyiyw.supabase.co/functions/v1/validar-token-acceso'
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
