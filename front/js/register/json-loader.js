// json-loader.js - Carga el JSON de usuarios de forma independiente
// Este archivo debe cargarse en TODAS las páginas que necesiten acceso a usuarios

(async function() {
    'use strict';

    console.log('📂 Cargando usuarios desde JSON...');

    try {
        const response = await fetch('../data/users.json');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        const usuarios = data.usuarios || [];
        
        console.log('✅ JSON cargado:', usuarios.length, 'usuarios');
        
        // Disparar evento para que UserManager los procese
        document.dispatchEvent(new CustomEvent('usuariosJSONCargados', {
            detail: { usuarios: usuarios }
        }));
        
    } catch (error) {
        console.error('❌ Error al cargar users.json:', error);
        
        // Disparar evento con array vacío
        document.dispatchEvent(new CustomEvent('usuariosJSONCargados', {
            detail: { usuarios: [] }
        }));
    }
})();