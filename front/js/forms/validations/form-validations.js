import { validarCampo, focusPrimerCampoInvalido } from "./validation-utils.js";

import {
	configurarContadorCaracteres,
	configurarValidacionDNI,
	configurarValidacionTelefono,
	configurarValidacionTexto,
	configurarValidacionNombreCompleto,
	configurarValidacionEmail,
} from "./field-validators.js";

import {
	configurarValidacionPassword,
	validarConfirmacionPassword,
} from "./password-validator.js";

import {
	manejarLogin,
	manejarRegistro,
	manejarContacto,
	manejarResetPassword,
} from "./form-handlers.js";

import { registrarEventosGlobales } from "./event-handlers.js";



/* Este es el archivo central del sistema de validación de formularios.
Su rol es orquestar y conectar todos los módulos anteriores: validadores, manejadores y eventos. */
(function () { //IIFE (Immediately Invoked Function Expression):Se ejecuta automáticamente al cargarse el script
	let validacionesInicializadas = false; // Variables de control
	let eventosRegistrados = false;

	const inicializarEventosGlobales = () => { /* Qué hace:
Registra solo una vez los event listeners globales (como los de resultadoLogin o resultadoRegistro) definidos en event-handlers.js.

Para qué:
Evita duplicar listeners si la página recarga partes del contenido sin recargar el DOM completo. */
		if (eventosRegistrados) return;

		eventosRegistrados = true;
		registrarEventosGlobales();
	};

	const configurarValidadores = () => {/* Qué hace:
Inicializa todos los validadores de campos individuales.

Cómo:
Llama a cada función importada desde field-validators.js o password-validator.js, que ya define los listeners para sus campos.

Para qué:
Centraliza toda la configuración de validación en un único punto, asegurando que se apliquen a todos los formularios cuando se carguen. */
		configurarContadorCaracteres();
		configurarValidacionDNI();
		configurarValidacionTelefono();
		configurarValidacionTexto();
		configurarValidacionNombreCompleto();
		configurarValidacionEmail();
		configurarValidacionPassword();
	};

	const debeValidarInput = (input, esFormularioLogin) => {/* Recorre todos los formularios con la clase .needs-validation.

Añade un input listener a cada campo para validarlo a medida que el usuario escribe.

Usa funciones auxiliares:

debeValidarInput() decide si un campo debe validarse.

aplicarValidacionInput() aplica la validación o limpia estilos.

Ejemplo:

Mientras el usuario escribe su DNI, se muestra si el valor es válido sin esperar el envío del formulario. */
		if (esFormularioLogin && input.id === "form-password") {
			return false;
		}
		return true;
	};

	const aplicarValidacionInput = (input) => {/* Qué:
Controla cómo validar cada campo.

Si es el campo de confirmación de contraseña, usa su validador específico.

Si tiene valor, se valida normalmente.

Si está vacío, limpia los estados visuales.

Para qué:
Uniformar la lógica de validación de todos los inputs sin repetir código. */
		if (input.id === "form-confirm-password") {
			validarConfirmacionPassword(input);
			return;
		}

		if (input.value.length > 0) {
			validarCampo(input);
		} else {
			input.classList.remove("is-valid", "is-invalid");
		}
	};

	const configurarValidacionTiempoReal = (forms) => {/* Qué:
Agrega listeners input a cada campo para validar mientras el usuario escribe.
Cómo:
Filtra qué inputs deben validarse según el formulario.
Para qué:
Proveer feedback instantáneo sin esperar al envío del formulario. */
		forms.forEach((form) => {
			const inputs = form.querySelectorAll("input, textarea, select");
			const esFormularioLogin = form.id === "login-form";

			inputs.forEach((input) => {
				input.addEventListener("input", function () {
					if (debeValidarInput(this, esFormularioLogin)) {
						aplicarValidacionInput(this);
					}
				});
			});
		});
	};

	const formHandlers = {/* Qué:
Mapa que asocia cada formulario con su función manejadora.
Para qué:
Permite identificar dinámicamente qué hacer al enviar cada formulario. */
		"login-form": manejarLogin,
		"register-form": manejarRegistro,
		"contact-form": manejarContacto,
		"forgotPassword-form": manejarResetPassword,
	};

	const procesarSubmit = (form) => {  /* Qué:
Controla el flujo al hacer submit.
Cómo:

Verifica la confirmación de contraseña si existe.

Si el formulario pasa checkValidity() (API nativa HTML5):

Llama al manejador correspondiente.

Si no pasa:

Añade la clase was-validated (Bootstrap style)

Enfoca el primer campo inválido.

Para qué:
Garantizar que solo se envíen formularios válidos y dar feedback visual claro. */
		const confirmPassword = document.getElementById(
			"form-confirm-password"
		);
		if (confirmPassword) {
			validarConfirmacionPassword(confirmPassword);
		}

		if (form.checkValidity()) {
			const handler = formHandlers[form.id];
			if (handler) handler(form);
		} else {
			form.classList.add("was-validated");
			focusPrimerCampoInvalido(form);
		}
	};

	const configurarSubmitFormularios = (forms) => {/* Qué:
Intercepta el envío estándar de los formularios.
Cómo:
Previene el comportamiento por defecto (recargar página) y llama procesarSubmit.
Para qué:
Controlar completamente la validación y la lógica de envío vía JS. */
		forms.forEach((form) => {
			form.addEventListener("submit", function (event) {
				event.preventDefault();
				event.stopPropagation();
				procesarSubmit(this);
			});
		});
	};

	const inicializarValidaciones = async () => {/* Qué:
Configura validaciones solo una vez, y solo si hay formularios con la clase .needs-validation.
Para qué:
Evita ejecutar validaciones innecesarias (optimización). */
		if (validacionesInicializadas) return;

		const forms = document.querySelectorAll(".needs-validation");
		if (forms.length === 0) return;

		validacionesInicializadas = true;

		configurarValidadores();
		configurarValidacionTiempoReal(forms);
		configurarSubmitFormularios(forms);
	};

	document.addEventListener("formRendered", inicializarValidaciones);/* Qué:

Cuando se renderiza un formulario dinámicamente (formRendered), se inicializan las validaciones.

Cuando el DOM está listo (DOMContentLoaded), se inicializan eventos globales y validaciones con un pequeño retardo.

Para qué:
Asegurar que los formularios estén disponibles en el DOM antes de configurarlos.
Permite compatibilidad con aplicaciones SPA o componentes cargados dinámicamente. */

	document.addEventListener("DOMContentLoaded", () => {
		inicializarEventosGlobales();
		setTimeout(inicializarValidaciones, 300);
	});
})();
