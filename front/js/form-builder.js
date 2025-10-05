// form-builder.js - Sistema dinámico para crear formularios
// ACTUALIZADO: Soporte para toggle de password y nombre completo

class FormBuilder {
  constructor(containerId, formType) {
    this.container = document.getElementById(containerId);
    this.formType = formType; 
    this.form = null;
    this.fieldsConfig = null;
  }

  // Cargar configuración de campos desde JSON
  async loadFieldsConfig() {
    try {
      const response = await fetch('./data/formFields.json');
      if (!response.ok) {
        throw new Error('No se pudo cargar formFields.json');
      }
      const data = await response.json();
      this.fieldsConfig = data[this.formType] || [];
      return this.fieldsConfig;
    } catch (error) {
      console.error('Error al cargar configuración de campos:', error);
      this.showErrorMessage('Error al cargar el formulario. Por favor, recarga la página.');
      return [];
    }
  }

  // Crear input field con validaciones HTML
  createField(fieldConfig, index) {
    const isTextarea = fieldConfig.type === 'textarea';
    const isPassword = fieldConfig.type === 'password';
    const colorClass = index % 2 === 0 ? 'primary' : 'secondary';
    
    // Construir atributos de validación HTML
    let validationAttrs = fieldConfig.required ? 'required' : '';
    if (fieldConfig.minlength) validationAttrs += ` minlength="${fieldConfig.minlength}"`;
    if (fieldConfig.maxlength) validationAttrs += ` maxlength="${fieldConfig.maxlength}"`;
    if (fieldConfig.pattern) validationAttrs += ` pattern="${fieldConfig.pattern}"`;
    if (fieldConfig.min) validationAttrs += ` min="${fieldConfig.min}"`;
    if (fieldConfig.max) validationAttrs += ` max="${fieldConfig.max}"`;
    
    // Crear el campo de input/textarea
    let inputHtml = '';
    
    if (isTextarea) {
      inputHtml = `
        <textarea 
          class="form-control" 
          id="form-${fieldConfig.id}" 
          name="${fieldConfig.id}"
          rows="${fieldConfig.rows || 4}" 
          placeholder="${fieldConfig.placeholder}"
          ${validationAttrs}
        ></textarea>
        ${fieldConfig.id === 'mensaje' ? '<div class="char-counter"><span id="contador-caracteres">0</span>/500</div>' : ''}
      `;
    } else {
      inputHtml = `
        <input 
          type="${fieldConfig.type}" 
          id="form-${fieldConfig.id}"
          name="${fieldConfig.id}"
          class="form-control" 
          placeholder="${fieldConfig.placeholder}"
          ${validationAttrs}
        />
      `;
      
      // Agregar botón toggle para contraseñas
      if (isPassword && fieldConfig.showToggle) {
        inputHtml += `
          <button 
            type="button" 
            class="password-toggle-btn" 
            data-target="form-${fieldConfig.id}"
            aria-label="Mostrar contraseña"
          >
            <i class="fa-solid fa-eye-slash pass"></i>
          </button>
        `;
      }
    }
    
    const fieldHtml = `
      <div class="form-outline ${isPassword && fieldConfig.showToggle ? 'password-wrapper' : ''}" data-color="${colorClass}">
        <i class="fa-solid ${fieldConfig.icon}"></i>
        <label for="form-${fieldConfig.id}" hidden>${fieldConfig.placeholder}</label>
        ${inputHtml}
        <div class="invalid-feedback"></div>
      </div>
    `;
    
    return fieldHtml;
  }

  // Crear botón de submit
  createSubmitButton() {
    const buttonTexts = {
      login: 'INICIAR SESIÓN',
      register: 'REGISTRARSE',
      forgotPassword: 'ENVIAR CORREO',
      contact: 'ENVIAR CONSULTA'
    };

    return `
      <button type="submit" class="btn btn-primary btn-block">
        ${buttonTexts[this.formType]}
      </button>
    `;
  }

  // Crear links adicionales
  createAdditionalLinks() {
    if (this.formType === 'login') {
      return `
        <div class="form-links">
          <a href="./register.html" class="link-secondary">¿No tienes cuenta? Regístrate</a>
          <a href="./password-reset.html" class="link-primary">¿Olvidaste tu contraseña?</a>
        </div>
      `;
    } else if (this.formType === 'register') {
      return `
        <div class="form-links">
          <a href="./login.html" class="link-secondary">¿Ya tienes cuenta? Inicia sesión</a>
        </div>
      `;
    }
    return '';
  }

  // Mostrar mensaje de error si no se puede cargar
  showErrorMessage(message) {
    this.container.innerHTML = `
      <div class="alert alert-danger" role="alert">
        <i class="fa-solid fa-circle-xmark"></i> ${message}
      </div>
    `;
  }

  // Renderizar formulario completo
  async render() {
    await this.loadFieldsConfig();
    
    if (!this.fieldsConfig || this.fieldsConfig.length === 0) {
      return;
    }

    const fieldsHtml = this.fieldsConfig.map((field, index) => 
      this.createField(field, index)
    ).join('');
    
    const formHtml = `
      <form id="${this.formType}-form" class="needs-validation" novalidate>
        ${fieldsHtml}
        ${this.createSubmitButton()}
        ${this.createAdditionalLinks()}
      </form>
    `;

    this.container.innerHTML = formHtml;
    this.form = document.getElementById(`${this.formType}-form`);
    
    // Inicializar toggle de contraseñas
    this.initPasswordToggles();
    
    console.log(`✅ Formulario ${this.formType} renderizado correctamente`);
    
    // Disparar evento personalizado
    document.dispatchEvent(new CustomEvent('formRendered', { 
      detail: { formType: this.formType } 
    }));
  }

  // Inicializar botones de toggle de contraseña
  initPasswordToggles() {
    const toggleButtons = this.form.querySelectorAll('.password-toggle-btn');
    
    toggleButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const icon = this.querySelector('i');
        
        if (input.type === 'password') {
          input.type = 'text';
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
          this.setAttribute('aria-label', 'Ocultar contraseña');
        } else {
          input.type = 'password';
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
          this.setAttribute('aria-label', 'Mostrar contraseña');
        }
      });
    });
  }
}

// Inicializar formulario según la página
document.addEventListener('DOMContentLoaded', async () => {
  const formsContainer = document.getElementById('formsType');
  
  if (formsContainer) {
    const path = window.location.pathname;
    let formType = 'contact';
    
    if (path.includes('login')) {
      formType = 'login';
    } else if (path.includes('register')) {
      formType = 'register';
    } else if (path.includes('contacto')) {
      formType = 'contact';
    } else if (path.includes('password-reset')){
      formType = 'forgotPassword';
    }
    
    const formBuilder = new FormBuilder('formsType', formType);
    await formBuilder.render();
  }
});