(function () {
    // ----------------------------------------------------
    //  DECLARACIÓN ÚNICA DE VARIABLES GLOBALES
    // ----------------------------------------------------
    const forms = document.querySelectorAll('.needs-validation');
    const mensajeTextarea = document.getElementById('mensaje');
    const contadorCaracteres = document.getElementById('contador-caracteres');
    const telefonoInput = document.getElementById('telefono');
    const nombreInput = document.getElementById('nombre');
    const apellidoInput = document.getElementById('apellido');
    const emailInput = document.getElementById('email');


    // ===== CONTADOR DE CARACTERES PARA TEXTAREA =====
    if (mensajeTextarea && contadorCaracteres) {
        contadorCaracteres.textContent = mensajeTextarea.value.length;

        mensajeTextarea.addEventListener('input', function () {
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

    // ===== VALIDACIÓN DE TELÉFONO (Solo números) =====
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function () {
            this.value = this.value.replace(/[^\d]/g, '');
        });
    }

    // ===== VALIDACIÓN DE NOMBRE Y APELLIDO (Solo texto) =====
    function validarSoloTexto(input) {
        input.addEventListener('input', function () {
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

    // ----------------------------------------------------
    // ===== VALIDACIÓN Y ENVÍO DEL FORMULARIO (FETCH/MODAL) =====
    // ----------------------------------------------------
    Array.from(forms).forEach(function (form) {
        form.addEventListener('submit', function (event) {

            event.preventDefault(); // Detiene el envío nativo del navegador
            event.stopPropagation();

            if (!form.checkValidity()) {
                // Lógica para mostrar errores de Bootstrap
                form.classList.add('was-validated');
                const primerCampoInvalido = form.querySelector('.form-control:invalid');
                if (primerCampoInvalido) {
                    primerCampoInvalido.focus();
                    primerCampoInvalido.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }

            } else {
                // Lógica de envío Fetch
                const nombre = nombreInput ? nombreInput.value : 'Cliente';
                const data = new FormData(form);
                const object = {};
                data.forEach((value, key) => (object[key] = value));
                const json = JSON.stringify(object);

                // Desactivar botón y feedback visual
                const submitButton = form.querySelector('button[type="submit"]');
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';

                fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: json
                })
                    .then(response => response.json())
                    .then(data => {
                        // ÉXITO: Mostrar Modal y Limpiar Formulario
                        const modalBody = document.getElementById('modal-mensaje');
                        modalBody.textContent = 'Gracias por tu consulta, ' + nombre + '. Te contactaremos pronto.';

                        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
                        successModal.show();

                        form.reset();
                        form.classList.remove('was-validated');

                        const inputs = form.querySelectorAll('input, textarea, select');
                        inputs.forEach(function (input) {
                            input.classList.remove('is-valid', 'is-invalid');
                        });
                        if (contadorCaracteres) {
                            contadorCaracteres.textContent = '0';
                        }
                    })
                    .catch(error => {
                        // ERROR
                        console.error('Error al enviar:', error);
                        alert('Hubo un error al enviar el formulario. Intenta más tarde.');
                    })
                    .finally(() => {
                        // Habilitar el botón
                        submitButton.disabled = false;
                        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar consulta';
                    });
            }
        }, false);
    });

    // ----------------------------------------------------
    // ===== OTRAS VALIDACIONES ADICIONALES =====
    // ----------------------------------------------------
    
    // Validación de estilos al salir del campo (blur) y al escribir (input)
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
    if (emailInput) {
        emailInput.addEventListener('blur', function () {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailPattern.test(this.value)) {
                this.setCustomValidity('Por favor, ingresá un correo electrónico válido.');
            } else {
                this.setCustomValidity('');
            }
        });
    }

    // Eliminar espacios en blanco al final de los campos
    const textInputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea');
    textInputs.forEach(function (input) {
        input.addEventListener('blur', function () {
            this.value = this.value.trim();
        });
    });

    console.log('✅ Validaciones del formulario cargadas correctamente');

})();