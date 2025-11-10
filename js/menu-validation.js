// js/menu-validation.js

class MenuValidator {
    constructor() {
        this.hasIntendenciaRole = false;
    }

    // Verificar si el usuario tiene rol INTENDENCIA
    async verificarRolIntendencia() {
    const userData = auth.getUserData();
    
    if (!userData || !userData.id_personal) {
        console.log('❌ No hay id_personal');
        return false;
    }

    try {
        console.log('🔍 Verificando rol para id_personal:', userData.id_personal);

        const response = await fetch(CONFIG.getEndpointURL('VALIDAR_ROL'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': CONFIG.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
                id_personal: userData.id_personal
            })
        });

        const result = await response.json();
        
        if (result.success && result.tiene_rol) {
            console.log('✅ Usuario tiene rol INTENDENCIA');
            this.hasIntendenciaRole = true;
            return true;
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
