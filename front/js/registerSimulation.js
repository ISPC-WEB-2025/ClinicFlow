// registerSimulation.js - Simulación de registro y persistencia con localStorage
// Permite registrar usuarios y validar contra localStorage + users.json

(function() {
    'use strict';

    const STORAGE_KEY = 'clinicflow_usuarios_registrados';
    
    // ===== CLASE PARA GESTIONAR USUARIOS =====
    class UserManager {
        constructor() {
            this.usuariosJSON = [];
            this.usuariosLocalStorage = this.cargarUsuariosLocalStorage();
        }

        // Cargar usuarios del JSON (desde el módulo principal)
        setUsuariosJSON(usuarios) {
            this.usuariosJSON = usuarios;
            console.log('📚 Usuarios del JSON cargados:', this.usuariosJSON.length);
        }

        // Cargar usuarios del localStorage
        cargarUsuariosLocalStorage() {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                const usuarios = data ? JSON.parse(data) : [];
                console.log('💾 Usuarios del localStorage cargados:', usuarios.length);
                return usuarios;
            } catch (error) {
                console.error('❌ Error al cargar localStorage:', error);
                return [];
            }
        }

        // Guardar usuarios en localStorage
        guardarUsuariosLocalStorage() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.usuariosLocalStorage));
                console.log('✅ Usuarios guardados en localStorage');
                return true;
            } catch (error) {
                console.error('❌ Error al guardar en localStorage:', error);
                return false;
            }
        }

        // Obtener todos los usuarios (JSON + localStorage)
        obtenerTodosLosUsuarios() {
            return [...this.usuariosJSON, ...this.usuariosLocalStorage];
        }

        // Verificar si un email ya existe
        emailExiste(email) {
            const emailLower = email.toLowerCase().trim();
            const todosUsuarios = this.obtenerTodosLosUsuarios();
            return todosUsuarios.some(user => user.email.toLowerCase() === emailLower);
        }

        // Registrar nuevo usuario
        registrarUsuario(datosUsuario) {
            const emailLower = datosUsuario.email.toLowerCase().trim();

            // Verificar si ya existe
            if (this.emailExiste(emailLower)) {
                return {
                    exito: false,
                    mensaje: 'Este email ya está registrado. Intentá con otro.'
                };
            }

            // Crear objeto de usuario con timestamp
            const nuevoUsuario = {
                id: this.generarId(),
                nombre: datosUsuario.nombre.trim(),
                apellido: datosUsuario.apellido.trim(),
                email: emailLower,
                password: datosUsuario.password, // En producción: NUNCA hacer esto, usar hash
                fechaRegistro: new Date().toISOString(),
                activo: true
            };

            // Agregar a localStorage
            this.usuariosLocalStorage.push(nuevoUsuario);
            
            // Guardar en localStorage
            if (this.guardarUsuariosLocalStorage()) {
                console.log('✅ Usuario registrado:', nuevoUsuario.email);
                return {
                    exito: true,
                    mensaje: `¡Registro exitoso, ${nuevoUsuario.nombre}!`,
                    usuario: nuevoUsuario
                };
            } else {
                // Revertir si falla el guardado
                this.usuariosLocalStorage.pop();
                return {
                    exito: false,
                    mensaje: 'Error al guardar el usuario. Intentá nuevamente.'
                };
            }
        }

        // Validar login (JSON + localStorage)
        validarLogin(email, password) {
            const emailLower = email.toLowerCase().trim();
            const todosUsuarios = this.obtenerTodosLosUsuarios();

            const usuarioValido = todosUsuarios.find(
                user => user.email.toLowerCase() === emailLower && 
                        user.password === password &&
                        user.activo !== false
            );

            if (usuarioValido) {
                // Determinar origen del usuario
                const esDeJSON = this.usuariosJSON.some(u => u.email === usuarioValido.email);
                
                return {
                    exito: true,
                    mensaje: '¡Bienvenido!',
                    usuario: usuarioValido,
                    origen: esDeJSON ? 'JSON' : 'localStorage'
                };
            }

            return {
                exito: false,
                mensaje: 'Email o contraseña incorrectos'
            };
        }

        // Generar ID único
        generarId() {
            return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        // Obtener estadísticas
        obtenerEstadisticas() {
            return {
                totalUsuarios: this.obtenerTodosLosUsuarios().length,
                usuariosJSON: this.usuariosJSON.length,
                usuariosRegistrados: this.usuariosLocalStorage.length
            };
        }

        // Limpiar usuarios de localStorage (útil para testing)
        limpiarLocalStorage() {
            try {
                localStorage.removeItem(STORAGE_KEY);
                this.usuariosLocalStorage = [];
                console.log('🗑️ localStorage limpiado');
                return true;
            } catch (error) {
                console.error('❌ Error al limpiar localStorage:', error);
                return false;
            }
        }

        // Exportar usuarios de localStorage (para backup)
        exportarUsuarios() {
            return {
                fecha: new Date().toISOString(),
                usuarios: this.usuariosLocalStorage
            };
        }
    }

    // ===== INSTANCIA GLOBAL DEL GESTOR =====
    const userManager = new UserManager();
    
    // Exponer al objeto window para acceso global
    window.UserManager = userManager;

    // ===== INTEGRACIÓN CON form-validations.js =====
    
    // Escuchar cuando se carguen los usuarios del JSON
    document.addEventListener('usuariosJSONCargados', (event) => {
        userManager.setUsuariosJSON(event.detail.usuarios);
    });

    // Escuchar evento de registro
    document.addEventListener('intentoRegistro', (event) => {
        const datosUsuario = event.detail;
        const resultado = userManager.registrarUsuario(datosUsuario);
        
        // Disparar evento con el resultado
        document.dispatchEvent(new CustomEvent('resultadoRegistro', {
            detail: resultado
        }));
    });

    // Escuchar evento de login
    document.addEventListener('intentoLogin', (event) => {
        const { email, password } = event.detail;
        const resultado = userManager.validarLogin(email, password);
        
        // Disparar evento con el resultado
        document.dispatchEvent(new CustomEvent('resultadoLogin', {
            detail: resultado
        }));
    });

    // ===== FUNCIONES DE UTILIDAD =====
    
    // Mostrar estadísticas en consola
    window.mostrarEstadisticasUsuarios = function() {
        const stats = userManager.obtenerEstadisticas();
        console.log('📊 ESTADÍSTICAS DE USUARIOS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Total de usuarios:', stats.totalUsuarios);
        console.log('  └─ Usuarios JSON:', stats.usuariosJSON);
        console.log('  └─ Usuarios registrados:', stats.usuariosRegistrados);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        if (stats.usuariosRegistrados > 0) {
            console.log('\n👥 Usuarios registrados (localStorage):');
            userManager.usuariosLocalStorage.forEach((user, index) => {
                console.log(`${index + 1}. ${user.nombre} ${user.apellido} (${user.email})`);
            });
        }
    };

    // Limpiar localStorage
    window.limpiarUsuariosRegistrados = function() {
        if (confirm('⚠️ ¿Estás seguro de que querés eliminar todos los usuarios registrados?')) {
            userManager.limpiarLocalStorage();
            alert('✅ Usuarios registrados eliminados correctamente');
            window.location.reload();
        }
    };

    // Exportar usuarios
    window.exportarUsuariosRegistrados = function() {
        const datos = userManager.exportarUsuarios();
        const json = JSON.stringify(datos, null, 2);
        
        // Crear blob y descargar
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `usuarios_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('💾 Backup descargado correctamente');
    };

    // ===== INICIALIZACIÓN =====
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🔐 Sistema de registro simulado cargado');
        console.log('💡 Comandos disponibles en consola:');
        console.log('  - mostrarEstadisticasUsuarios()');
        console.log('  - limpiarUsuariosRegistrados()');
        console.log('  - exportarUsuariosRegistrados()');
        
        // Mostrar estadísticas iniciales
        setTimeout(() => {
            mostrarEstadisticasUsuarios();
        }, 1000);
    });

    // ===== VALIDACIÓN DE DISPONIBILIDAD DE LOCALSTORAGE =====
    function testLocalStorage() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('⚠️ localStorage no está disponible');
            return false;
        }
    }

    if (!testLocalStorage()) {
        console.error('❌ localStorage no está disponible. El sistema de registro no funcionará.');
    }

})();