// registerSimulation.js - Simulación de registro y persistencia
// ACTUALIZADO: Soporte para reset de contraseña

(function() {
    'use strict';

    const STORAGE_KEY = 'clinicflow_usuarios_registrados';
    
    class UserManager {
        constructor() {
            this.usuariosJSON = [];
            this.usuariosLocalStorage = this.cargarUsuariosLocalStorage();
        }

        setUsuariosJSON(usuarios) {
            this.usuariosJSON = usuarios;
            console.log('📚 Usuarios del JSON cargados:', this.usuariosJSON.length);
        }

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

        obtenerTodosLosUsuarios() {
            return [...this.usuariosJSON, ...this.usuariosLocalStorage];
        }

        emailExiste(email) {
            const emailLower = email.toLowerCase().trim();
            const todosUsuarios = this.obtenerTodosLosUsuarios();
            return todosUsuarios.some(user => user.email.toLowerCase() === emailLower);
        }

        registrarUsuario(datosUsuario) {
            const emailLower = datosUsuario.email.toLowerCase().trim();

            if (this.emailExiste(emailLower)) {
                return {
                    exito: false,
                    mensaje: 'Este email ya está registrado. Intentá con otro.'
                };
            }

            const nuevoUsuario = {
                id: this.generarId(),
                nombre: datosUsuario.nombre.trim(),
                apellido: datosUsuario.apellido.trim(),
                email: emailLower,
                password: datosUsuario.password,
                fechaRegistro: new Date().toISOString(),
                activo: true
            };

            this.usuariosLocalStorage.push(nuevoUsuario);
            
            if (this.guardarUsuariosLocalStorage()) {
                console.log('✅ Usuario registrado:', nuevoUsuario.email);
                return {
                    exito: true,
                    mensaje: `¡Registro exitoso, ${nuevoUsuario.nombre}!`,
                    usuario: nuevoUsuario
                };
            } else {
                this.usuariosLocalStorage.pop();
                return {
                    exito: false,
                    mensaje: 'Error al guardar el usuario. Intentá nuevamente.'
                };
            }
        }

        validarLogin(email, password) {
            const emailLower = email.toLowerCase().trim();
            const todosUsuarios = this.obtenerTodosLosUsuarios();

            const usuarioValido = todosUsuarios.find(
                user => user.email.toLowerCase() === emailLower && 
                        user.password === password &&
                        user.activo !== false
            );

            if (usuarioValido) {
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

        // ===== NUEVA FUNCIONALIDAD: RESET PASSWORD =====
        verificarEmailParaReset(email) {
            const emailLower = email.toLowerCase().trim();
            
            if (this.emailExiste(emailLower)) {
                console.log('✅ Email válido para reset:', emailLower);
                return {
                    exito: true,
                    mensaje: 'Se ha enviado un correo a tu casilla con las instrucciones para restablecer tu contraseña.'
                };
            } else {
                console.log('❌ Email no encontrado:', emailLower);
                return {
                    exito: false,
                    mensaje: 'El mail indicado no forma parte de nuestra base de datos.'
                };
            }
        }

        generarId() {
            return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        obtenerEstadisticas() {
            return {
                totalUsuarios: this.obtenerTodosLosUsuarios().length,
                usuariosJSON: this.usuariosJSON.length,
                usuariosRegistrados: this.usuariosLocalStorage.length
            };
        }

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

        exportarUsuarios() {
            return {
                fecha: new Date().toISOString(),
                usuarios: this.usuariosLocalStorage
            };
        }
    }

    const userManager = new UserManager();
    window.UserManager = userManager;

    // ===== INTEGRACIÓN CON form-validations.js =====
    
    document.addEventListener('usuariosJSONCargados', (event) => {
        userManager.setUsuariosJSON(event.detail.usuarios);
    });

    document.addEventListener('intentoRegistro', (event) => {
        const datosUsuario = event.detail;
        const resultado = userManager.registrarUsuario(datosUsuario);
        
        document.dispatchEvent(new CustomEvent('resultadoRegistro', {
            detail: resultado
        }));
    });

    document.addEventListener('intentoLogin', (event) => {
        const { email, password } = event.detail;
        const resultado = userManager.validarLogin(email, password);
        
        document.dispatchEvent(new CustomEvent('resultadoLogin', {
            detail: resultado
        }));
    });

    // ===== NUEVO: EVENTO PARA RESET PASSWORD =====
    document.addEventListener('intentoResetPassword', (event) => {
        const { email } = event.detail;
        const resultado = userManager.verificarEmailParaReset(email);
        
        document.dispatchEvent(new CustomEvent('resultadoResetPassword', {
            detail: resultado
        }));
    });

    // ===== FUNCIONES DE UTILIDAD =====
    
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

    window.limpiarUsuariosRegistrados = function() {
        if (confirm('⚠️ ¿Estás seguro de que querés eliminar todos los usuarios registrados?')) {
            userManager.limpiarLocalStorage();
            alert('✅ Usuarios registrados eliminados correctamente');
            window.location.reload();
        }
    };

    window.exportarUsuariosRegistrados = function() {
        const datos = userManager.exportarUsuarios();
        const json = JSON.stringify(datos, null, 2);
        
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `usuarios_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('💾 Backup descargado correctamente');
    };

    document.addEventListener('DOMContentLoaded', () => {
        console.log('🔐 Sistema de registro simulado cargado');
        console.log('💡 Comandos disponibles en consola:');
        console.log('  - mostrarEstadisticasUsuarios()');
        console.log('  - limpiarUsuariosRegistrados()');
        console.log('  - exportarUsuariosRegistrados()');
        
        setTimeout(() => {
            mostrarEstadisticasUsuarios();
        }, 1000);
    });

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