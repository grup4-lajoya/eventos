// js/menu-validation.js

class MenuValidator {
    constructor() {
        this.hasIntendenciaRole = false;
    }

    // Verificar si el usuario tiene rol INTENDENCIA
    async verificarRolIntendencia() {
        const userData = auth.getUserData();
        
        if (!userData) {
            console.log('❌ No hay datos de usuario');
            return false;
        }

        try {
            // Obtener NSA según tipo de usuario
            let nsa = null;

            if (userData.tipo_usuario === 'personal' && userData.id_personal) {
                // Consultar NSA del personal
                const { data: personal, error } = await this.supabaseQuery(
                    'personal',
                    'nsa',
                    'id',
                    userData.id_personal
                );

                if (error) throw error;
                if (personal && personal.length > 0) {
                    nsa = personal[0].nsa;
                }
            }

            if (!nsa) {
                console.log('ℹ️ Usuario sin NSA (foráneo o sin datos)');
                return false;
            }

            console.log('🔍 Verificando rol para NSA:', nsa);

            // Consultar en tabla users
            const { data: users, error: usersError } = await this.supabaseQuery(
                'users',
                'usuario, rol, activo',
                'usuario',
                nsa
            );

            if (usersError) throw usersError;

            if (users && users.length > 0) {
                const user = users[0];
                console.log('👤 Usuario encontrado:', user);

                // Validar activo y rol INTENDENCIA
                if (user.activo === true && user.rol === 'INTENDENCIA') {
                    console.log('✅ Usuario tiene rol INTENDENCIA');
                    this.hasIntendenciaRole = true;
                    return true;
                }
            }

            console.log('ℹ️ Usuario no tiene rol INTENDENCIA');
            return false;

        } catch (error) {
            console.error('❌ Error verificando rol:', error);
            return false;
        }
    }

    // Helper para consultas a Supabase
    async supabaseQuery(table, select, filterColumn, filterValue) {
        const url = `${CONFIG.SUPABASE_URL}/rest/v1/${table}?${filterColumn}=eq.${filterValue}&select=${select}`;
        
        const response = await fetch(url, {
            headers: {
                'apikey': CONFIG.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error en consulta: ${response.statusText}`);
        }

        const data = await response.json();
        return { data, error: null };
    }

    // Mostrar/ocultar tercer ícono
    mostrarIconoTerminal() {
        const terminalCard = document.getElementById('terminalCard');
        
        if (terminalCard) {
            if (this.hasIntendenciaRole) {
                terminalCard.style.display = 'block';
                terminalCard.classList.remove('disabled');
                console.log('✅ Ícono Terminal Control visible');
            } else {
                terminalCard.style.display = 'none';
                console.log('ℹ️ Ícono Terminal Control oculto');
            }
        }
    }

    // Inicializar validación
    async inicializar() {
        console.log('🔄 Iniciando validación de menú...');
        
        const tieneRol = await this.verificarRolIntendencia();
        this.mostrarIconoTerminal();
        
        return tieneRol;
    }
}

// Instancia global
const menuValidator = new MenuValidator();
