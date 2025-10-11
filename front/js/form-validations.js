(function() {
    const forms = document.querySelectorAll('.needs-validation');
    
    // ===== CONTADOR DE CARACTERES PARA TEXTAREA =====
    const mensajeTextarea = document.getElementById('mensaje');
    const contadorCaracteres = document.getElementById('contador-caracteres');
    
    if (mensajeTextarea && contadorCaracteres) {
        contadorCaracteres.textContent = mensajeTextarea.value.length;
        
        mensajeTextarea.addEventListener('input', function() {
            contadorCaracteres.textContent = this.value.length;
            
            if (this.value.length >= 10 && this.value.length <= 500) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else if (this.value.length > 0) {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            }
        });
    }
    
    // ===== VALIDACIÓN DE TELÉFONO =====
    const telefonoInput = document.getElementById('telefono');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^\d]/g, '');
        });
    }
    
    // ===== VALIDACIÓN DE NOMBRE Y APELLIDO =====
    const nombreInput = document.getElementById('nombre');
    const apellidoInput = document.getElementById('apellido');
    
    function validarSoloTexto(input) {
        input.addEventListener('input', function() {
            this.value = this.value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/g, '');
            
            if (this.value.length >= 2 && this.value.length <= 50) {
                this.setCustomValidity('');
            } else if (this.value.length > 0 && this.value.length < 2) {
                this.setCustomValidity('Debe tener al menos 2 caracteres');
            }
        });
    }
    
    if (nombreInput) validarSoloTexto(nombreInput);
    if (apellidoInput) validarSoloTexto(apellidoInput);
    
    // ===== VALIDACIÓN AL ENVIAR EL FORMULARIO =====
    Array.from(forms).forEach(function(form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            event.stopPropagation();

            if (form.checkValidity()) {
                alert('¡Formulario enviado correctamente! Gracias por tu consulta, ' + 
                      nombreInput.value + '. Te contactaremos pronto.');
                
                form.reset();
                form.classList.remove('was-validated');

                const inputs = form.querySelectorAll('input, textarea, select');
                inputs.forEach(function(input) {
                    input.classList.remove('is-valid', 'is-invalid');
                });
                if (contadorCaracteres) {
                    contadorCaracteres.textContent = '0';
                }
                
                
            } else {
                form.classList.add('was-validated');
                
                const primerCampoInvalido = form.querySelector('.form-control:invalid');
                if (primerCampoInvalido) {
                    primerCampoInvalido.focus();
                    primerCampoInvalido.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
            }
        }, false);
    });
    
    Array.from(forms).forEach(function(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        Array.from(inputs).forEach(function(input) {
            input.addEventListener('blur', function() {
                if (this.checkValidity()) {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                } else if (this.value.length > 0) {
                    this.classList.remove('is-valid');
                    this.classList.add('is-invalid');
                }
            });
            
            input.addEventListener('input', function() {
                if (form.classList.contains('was-validated')) {
                    if (this.checkValidity()) {
                        this.classList.remove('is-invalid');
                        this.classList.add('is-valid');
                    } else {
                        this.classList.remove('is-valid');
                        this.classList.add('is-invalid');
                    }
                }
            });
        });
    });
    
    
    // Validación personalizada para email (adicional a la del navegador)
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailPattern.test(this.value)) {
                this.setCustomValidity('Por favor, ingresá un correo electrónico válido.');
            } else {
                this.setCustomValidity('');
            }
        });
    }
    
    const textInputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea');
    textInputs.forEach(function(input) {
        input.addEventListener('blur', function() {
            this.value = this.value.trim();
        });
    });
    
    console.log('✅ Validaciones del formulario cargadas correctamente');
    
})();