(function() {
    const STORAGE_KEY = 'clinicflow_usuarios_registrados';
    
    class UserManager {
        constructor() {
            this.usuariosJSON = [];
            this.usuariosLocalStorage = this.cargarUsuariosLocalStorage();
        }

        setUsuariosJSON(usuarios) {
            this.usuariosJSON = usuarios;
        }

        cargarUsuariosLocalStorage() {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                return data ? JSON.parse(data) : [];
            } catch {
                return [];
            }
        }

        guardarUsuariosLocalStorage() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.usuariosLocalStorage));
                return true;
            } catch {
                return false;
            }
        }

        obtenerTodosLosUsuarios() {
            return [...this.usuariosJSON, ...this.usuariosLocalStorage];
        }

        normalizarEmail(email) {
            return email.toLowerCase().trim();
        }

        emailExiste(email) {
            const emailNormalizado = this.normalizarEmail(email);
            return this.obtenerTodosLosUsuarios().some(
                user => this.normalizarEmail(user.email) === emailNormalizado
            );
        }

        dniExiste(dni) {
            const dniLimpio = dni.toString().trim();
            return this.obtenerTodosLosUsuarios().some(
                user => user.dni && user.dni.toString() === dniLimpio
            );
        }

        crearUsuario(datosUsuario, emailNormalizado, dniLimpio) {
            return {
                id: this.generarId(),
                nombre: datosUsuario.nombre.trim(),
                apellido: datosUsuario.apellido.trim(),
                email: emailNormalizado,
                password: datosUsuario.password,
                telefono: datosUsuario.telefono?.trim() || '',
                dni: dniLimpio,
                fechaRegistro: new Date().toISOString(),
                activo: true,
                rol: 'Usuario',
                institucion: '',
                especialidad: '',
                matricula: '',
                departamento: '',
                estadisticas: {
                    pacientes: 0,
                    consultas: 0,
                    horasServicio: 0,
                    calificacion: 5.0
                }
            };
        }

        registrarUsuario(datosUsuario) {
            const emailNormalizado = this.normalizarEmail(datosUsuario.email);
            const dniLimpio = datosUsuario.dni?.toString().trim() || '';

            if (this.emailExiste(emailNormalizado)) {
                return {
                    exito: false,
                    mensaje: 'Este email ya está registrado. Intentá con otro.'
                };
            }

            if (dniLimpio && this.dniExiste(dniLimpio)) {
                return {
                    exito: false,
                    mensaje: 'Este DNI ya está registrado.'
                };
            }

            const nuevoUsuario = this.crearUsuario(datosUsuario, emailNormalizado, dniLimpio);
            this.usuariosLocalStorage.push(nuevoUsuario);
            
            if (this.guardarUsuariosLocalStorage()) {
                return {
                    exito: true,
                    mensaje: `¡Registro exitoso, ${nuevoUsuario.nombre}!`,
                    usuario: nuevoUsuario
                };
            }
            
            this.usuariosLocalStorage.pop();
            return {
                exito: false,
                mensaje: 'Error al guardar el usuario. Intentá nuevamente.'
            };
        }

        esDeJSON(email) {
            return this.usuariosJSON.some(u => u.email === email);
        }

        validarLogin(email, password) {
            const emailNormalizado = this.normalizarEmail(email);
            const usuarioValido = this.obtenerTodosLosUsuarios().find(
                user => this.normalizarEmail(user.email) === emailNormalizado && 
                        user.password === password &&
                        user.activo !== false
            );

            if (usuarioValido) {
                return {
                    exito: true,
                    mensaje: '¡Bienvenido!',
                    usuario: usuarioValido,
                    origen: this.esDeJSON(usuarioValido.email) ? 'JSON' : 'localStorage'
                };
            }

            return {
                exito: false,
                mensaje: 'Email o contraseña incorrectos'
            };
        }

        obtenerUsuarioPorEmail(email) {
            const emailNormalizado = this.normalizarEmail(email);
            const usuario = this.obtenerTodosLosUsuarios().find(
                user => this.normalizarEmail(user.email) === emailNormalizado
            );

            if (usuario) {
                return {
                    exito: true,
                    usuario: usuario,
                    origen: this.esDeJSON(usuario.email) ? 'JSON' : 'localStorage'
                };
            }

            return {
                exito: false,
                mensaje: 'Usuario no encontrado'
            };
        }

        actualizarUsuarioJSON(emailNormalizado, datosActualizados) {
            let usuarioEnLS = this.usuariosLocalStorage.find(
                u => this.normalizarEmail(u.email) === emailNormalizado
            );

            const usuarioJSON = this.usuariosJSON.find(
                u => this.normalizarEmail(u.email) === emailNormalizado
            );

            if (!usuarioEnLS) {
                usuarioEnLS = JSON.parse(JSON.stringify(usuarioJSON));
                this.usuariosLocalStorage.push(usuarioEnLS);
            }

            Object.assign(usuarioEnLS, datosActualizados);
            usuarioEnLS.fechaActualizacion = new Date().toISOString();

            return this.guardarUsuariosLocalStorage() ? {
                exito: true,
                mensaje: 'Perfil actualizado correctamente',
                usuario: usuarioEnLS
            } : null;
        }

        actualizarUsuarioLocal(emailNormalizado, datosActualizados) {
            const index = this.usuariosLocalStorage.findIndex(
                u => this.normalizarEmail(u.email) === emailNormalizado
            );

            if (index === -1) return null;

            Object.assign(this.usuariosLocalStorage[index], datosActualizados);
            this.usuariosLocalStorage[index].fechaActualizacion = new Date().toISOString();

            return this.guardarUsuariosLocalStorage() ? {
                exito: true,
                mensaje: 'Perfil actualizado correctamente',
                usuario: this.usuariosLocalStorage[index]
            } : null;
        }

        actualizarPerfil(email, datosActualizados) {
            const emailNormalizado = this.normalizarEmail(email);
            const esDelJSON = this.usuariosJSON.some(
                u => this.normalizarEmail(u.email) === emailNormalizado
            );
            
            const resultado = esDelJSON 
                ? this.actualizarUsuarioJSON(emailNormalizado, datosActualizados)
                : this.actualizarUsuarioLocal(emailNormalizado, datosActualizados);

            return resultado || {
                exito: false,
                mensaje: 'Error al actualizar el perfil'
            };
        }

        verificarEmailParaReset(email) {
            return this.emailExiste(email) ? {
                exito: true,
                mensaje: 'Se ha enviado un correo a tu casilla con las instrucciones para restablecer tu contraseña.'
            } : {
                exito: false,
                mensaje: 'El mail indicado no forma parte de nuestra base de datos.'
            };
        }

        generarId() {
            return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
    }

    const userManager = new UserManager();
    window.UserManager = userManager;

    const eventHandlers = {
        'usuariosJSONCargados': (event) => {
            userManager.setUsuariosJSON(event.detail.usuarios);
        },
        'intentoRegistro': (event) => {
            const resultado = userManager.registrarUsuario(event.detail);
            document.dispatchEvent(new CustomEvent('resultadoRegistro', { detail: resultado }));
        },
        'intentoLogin': (event) => {
            const { email, password } = event.detail;
            const resultado = userManager.validarLogin(email, password);
            document.dispatchEvent(new CustomEvent('resultadoLogin', { detail: resultado }));
        },
        'intentoResetPassword': (event) => {
            const { email } = event.detail;
            const resultado = userManager.verificarEmailParaReset(email);
            document.dispatchEvent(new CustomEvent('resultadoResetPassword', { detail: resultado }));
        },
        'cargarPerfilUsuario': (event) => {
            const { email } = event.detail;
            const resultado = userManager.obtenerUsuarioPorEmail(email);
            document.dispatchEvent(new CustomEvent('perfilUsuarioCargado', { detail: resultado }));
        },
        'actualizarPerfilUsuario': (event) => {
            const { email, datos } = event.detail;
            const resultado = userManager.actualizarPerfil(email, datos);
            document.dispatchEvent(new CustomEvent('perfilUsuarioActualizado', { detail: resultado }));
        }
    };

    Object.entries(eventHandlers).forEach(([eventName, handler]) => {
        document.addEventListener(eventName, handler);
    });
})();