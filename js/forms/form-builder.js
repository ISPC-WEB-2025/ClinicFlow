class FormBuilder {
  constructor(containerId, formType) {
    this.container = document.getElementById(containerId);
    this.formType = formType; 
    this.form = null;
    this.fieldsConfig = null;
  }

  async loadFieldsConfig() {
    try {
      const response = await fetch('../data/formFields.json');
      if (!response.ok) {
        throw new Error('No se pudo cargar formFields.json');
      }
      const data = await response.json();
      this.fieldsConfig = data[this.formType] || [];
      return this.fieldsConfig;
    } catch {
      this.showErrorMessage('Error al cargar el formulario. Por favor, recarga la página.');
      return [];
    }
  }

  buildValidationAttrs(fieldConfig) {
    const attrs = [];
    
    if (fieldConfig.required) attrs.push('required');
    if (fieldConfig.minlength) attrs.push(`minlength="${fieldConfig.minlength}"`);
    if (fieldConfig.maxlength) attrs.push(`maxlength="${fieldConfig.maxlength}"`);
    if (fieldConfig.pattern) attrs.push(`pattern="${fieldConfig.pattern}"`);
    if (fieldConfig.min) attrs.push(`min="${fieldConfig.min}"`);
    if (fieldConfig.max) attrs.push(`max="${fieldConfig.max}"`);
    
    return attrs.join(' ');
  }

  createTextarea(fieldConfig, validationAttrs) {
    const counterHtml = fieldConfig.id === 'mensaje' 
      ? '<div class="char-counter"><span id="contador-caracteres">0</span>/500</div>' 
      : '';

    return `
      <textarea 
        class="form-control" 
        id="form-${fieldConfig.id}" 
        name="${fieldConfig.id}"
        rows="${fieldConfig.rows || 4}" 
        placeholder="${fieldConfig.placeholder}"
        ${validationAttrs}
      ></textarea>
      ${counterHtml}
    `;
  }

  createInput(fieldConfig, validationAttrs) {
    const toggleButton = fieldConfig.type === 'password' && fieldConfig.showToggle
      ? `
        <button 
          type="button" 
          class="password-toggle-btn" 
          data-target="form-${fieldConfig.id}"
          aria-label="Mostrar contraseña"
        >
          <i class="fa-solid fa-eye-slash pass"></i>
        </button>
      `
      : '';

    return `
      <input 
        type="${fieldConfig.type}" 
        id="form-${fieldConfig.id}"
        name="${fieldConfig.id}"
        class="form-control" 
        placeholder="${fieldConfig.placeholder}"
        ${validationAttrs}
      />
      ${toggleButton}
    `;
  }

  createField(fieldConfig, index) {
    const isTextarea = fieldConfig.type === 'textarea';
    const isPassword = fieldConfig.type === 'password';
    const colorClass = index % 2 === 0 ? 'primary' : 'secondary';
    const validationAttrs = this.buildValidationAttrs(fieldConfig);
    
    const inputHtml = isTextarea 
      ? this.createTextarea(fieldConfig, validationAttrs)
      : this.createInput(fieldConfig, validationAttrs);
    
    const wrapperClass = isPassword && fieldConfig.showToggle ? 'password-wrapper' : '';
    
    return `
      <div class="form-outline ${wrapperClass}" data-color="${colorClass}">
        <i class="fa-solid ${fieldConfig.icon}"></i>
        <label for="form-${fieldConfig.id}" hidden>${fieldConfig.placeholder}</label>
        ${inputHtml}
        <div class="invalid-feedback"></div>
      </div>
    `;
  }

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

  createAdditionalLinks() {
    const links = {
      login: `
        <div class="form-links">
          <a href="./register.html" class="link-secondary">¿No tienes cuenta? Regístrate</a>
          
      `,
      register: `
        <div class="form-links">
          <a href="./login.html" class="link-secondary">¿Ya tienes cuenta? Inicia sesión</a>
        </div>
      `
    };

    return links[this.formType] || '';
  }

  showErrorMessage(message) {
    this.container.innerHTML = `
      <div class="alert alert-danger" role="alert">
        <i class="fa-solid fa-circle-xmark"></i> ${message}
      </div>
    `;
  }

  togglePasswordVisibility(button) {
    const targetId = button.getAttribute('data-target');
    const input = document.getElementById(targetId);
    const icon = button.querySelector('i');
    const isPassword = input.type === 'password';
    
    input.type = isPassword ? 'text' : 'password';
    icon.classList.toggle('fa-eye-slash', !isPassword);
    icon.classList.toggle('fa-eye', isPassword);
    button.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
  }

  initPasswordToggles() {
    this.form.querySelectorAll('.password-toggle-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.togglePasswordVisibility(button);
      });
    });
  }

  async render() {
    await this.loadFieldsConfig();
    
    if (!this.fieldsConfig?.length) return;

    const fieldsHtml = this.fieldsConfig
      .map((field, index) => this.createField(field, index))
      .join('');
    
    const formHtml = `
      <form id="${this.formType}-form" class="needs-validation" novalidate>
        ${fieldsHtml}
        ${this.createSubmitButton()}
        ${this.createAdditionalLinks()}
      </form>
    `;

    this.container.innerHTML = formHtml;
    this.form = document.getElementById(`${this.formType}-form`);
    
    this.initPasswordToggles();
    
    document.dispatchEvent(new CustomEvent('formRendered', { 
      detail: { formType: this.formType } 
    }));
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const formsContainer = document.getElementById('formsType');
  
  if (!formsContainer) return;

  const formTypeMap = {
    'login': 'login',
    'register': 'register',
    'contacto': 'contact',
    'password-reset': 'forgotPassword'
  };

  const path = window.location.pathname;
  const formType = Object.entries(formTypeMap).find(([key]) => path.includes(key))?.[1] || 'contact';
  
  const formBuilder = new FormBuilder('formsType', formType);
  await formBuilder.render();
});