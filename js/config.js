// js/config.js
const CONFIG = {
    // Supabase
    SUPABASE_URL: 'https://qgbixgvidxeaoxxpyiyw.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnYml4Z3ZpZHhlYW94eHB5aXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTU3NzMsImV4cCI6MjA3NTc3MTc3M30.NQ5n_vFnHDp8eNjV3I9vRujfWDWWGAywgyICpqX0OKQ',
    
    // Edge Functions
    ENDPOINTS: {
        REGISTRO: '/functions/v1/public-registro',
        LOGIN: '/functions/v1/public-login',
        VALIDAR_TOKEN: '/functions/v1/public-validar-token',
        VALIDAR_ROL: '/functions/v1/validar-rol-intendencia',
        VALIDAR_QR_RANCHO: '/functions/v1/validar-qr-rancho',
        BUSCAR_RESERVA_NSA: '/functions/v1/buscar-reserva-nsa',
        VALIDAR_ELEGIBILIDAD: '/functions/v1/validar-elegibilidad-rancho',
        RESERVA_EXPRESS: '/functions/v1/reserva-express-rancho'
    },
    
    // Rutas de la app
    ROUTES: {
        REGISTRO: '/eventos/registro.html',
        LOGIN: '/eventos/login.html',
        HOME: '/eventos/index.html',
        RESERVAS: '/eventos/reservas.html',
        TERMINAL_RANCHO: '/eventos/terminal-rancho.html'
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
        USUARIO_DATA: 'usuario_data'
    },
    
    // Configuración de validación
    VALIDATION: {
        TOKEN_CHECK_INTERVAL: 5 * 60 * 1000,
        AUTO_LOGOUT_ON_ERROR: true
    },
    
    // PWA
    APP_NAME: 'Sistema de Reservas',
    APP_VERSION: '1.0.0'
};

CONFIG.getEndpointURL = function(endpoint) {
    return `${this.SUPABASE_URL}${this.ENDPOINTS[endpoint]}`;
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
