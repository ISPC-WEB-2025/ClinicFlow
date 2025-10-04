// form-builder.js - Sistema dinámico para crear formularios de login y registro

class FormBuilder {
  constructor(containerId, formType) {
    this.container = document.getElementById(containerId);
    this.formType = formType; 
    this.form = null;
    this.errors = {};
  }

  // Configuración de campos según tipo de formulario
  getFieldsConfig() {
    const configs = {
      login: [
        {
          id: 'email',
          type: 'email',
          placeholder: 'Email',
          icon: 'fa-envelope',
          required: true,
          validation: 'email'
        },
        {
          id: 'password',
          type: 'password',
          placeholder: 'Contraseña',
          icon: 'fa-lock',
          required: true,
          validation: 'password'
        }
      ],
      register: [
        {
          id: 'nombre',
          type: 'text',
          placeholder: 'Nombre completo',
          icon: 'fa-user-tie',
          required: true,
          validation: 'name'
        },
        {
          id: 'telefono',
          type: 'tel',
          placeholder: 'Teléfono',
          icon: 'fa-phone',
          required: true,
          validation: 'phone'
        },
        {
          id: 'email',
          type: 'email',
          placeholder: 'Email',
          icon: 'fa-envelope',
          required: true,
          validation: 'email'
        },
        {
          id: 'password',
          type: 'password',
          placeholder: 'Contraseña',
          icon: 'fa-lock',
          required: true,
          validation: 'password'
        },
        {
          id: 'confirm-password',
          type: 'password',
          placeholder: 'Confirmar contraseña',
          icon: 'fa-lock',
          required: true,
          validation: 'confirmPassword'
        }
      ],
      contact: [
        {
          id: 'nombre',
          type: 'text',
          placeholder: 'Nombre',
          icon: 'fa-user-tie',
          required: true,
          validation: 'name'
        },
        {
          id: 'telefono',
          type: 'tel',
          placeholder: 'Teléfono',
          icon: 'fa-phone',
          required: true,
          validation: 'phone'
        },
        {
          id: 'email',
          type: 'email',
          placeholder: 'Email',
          icon: 'fa-envelope',
          required: true,
          validation: 'email'
        },
        {
          id: 'mensaje',
          type: 'textarea',
          placeholder: 'Mensaje',
          icon: 'fa-pen-to-square',
          required: true,
          validation: 'message',
          rows: 4
        }
      ]
    };

    return configs[this.formType] || [];
  }

  // Reglas de validación
  validateField(field, value) {
    const rules = {
      name: (val) => {
        if (!val || val.trim().length < 3) {
          return 'El nombre debe tener al menos 3 caracteres';
        }
        if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(val)) {
          return 'El nombre solo puede contener letras';
        }
        return null;
      },
      email: (val) => {
        if (!val) return 'El email es requerido';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(val) ? null : 'Email inválido';
      },
      phone: (val) => {
        if (!val) return 'El teléfono es requerido';
        const phoneRegex = /^[\d\s\-\+\(\)]{8,}$/;
        return phoneRegex.test(val) ? null : 'Teléfono inválido (mínimo 8 dígitos)';
      },
      password: (val) => {
        if (!val) return 'La contraseña es requerida';
        if (val.length < 6) {
          return 'La contraseña debe tener al menos 6 caracteres';
        }
        return null;
      },
      confirmPassword: (val) => {
        const password = document.getElementById('form-password')?.value;
        if (!val) return 'Debe confirmar la contraseña';
        return val === password ? null : 'Las contraseñas no coinciden';
      },
      message: (val) => {
        if (!val || val.trim().length < 10) {
          return 'El mensaje debe tener al menos 10 caracteres';
        }
        return null;
      }
    };

    return rules[field.validation]?.(value) || null;
  }

  // Crear input field
  createField(fieldConfig, index) {
    const isTextarea = fieldConfig.type === 'textarea';
    const colorClass = index % 2 === 0 ? 'primary' : 'secondary';
    
    const fieldHtml = `
      <div class="form-outline" data-color="${colorClass}">
        <i class="fa-solid ${fieldConfig.icon}"></i>
        <label for="form-${fieldConfig.id}" hidden>${fieldConfig.placeholder}</label>
        ${isTextarea ? 
          `<textarea 
            class="form-control" 
            id="form-${fieldConfig.id}" 
            rows="${fieldConfig.rows || 4}" 
            placeholder="${fieldConfig.placeholder}"
            ${fieldConfig.required ? 'required' : ''}
          ></textarea>` :
          `<input 
            type="${fieldConfig.type}" 
            id="form-${fieldConfig.id}" 
            class="form-control" 
            placeholder="${fieldConfig.placeholder}"
            ${fieldConfig.required ? 'required' : ''}
          />`
        }
        <div class="error-message"></div>
      </div>
    `;
    
    return fieldHtml;
  }

  // Crear botón de submit
  createSubmitButton() {
    const buttonTexts = {
      login: 'INICIAR SESIÓN',
      register: 'REGISTRARSE',
      contact: 'ENVIAR CONSULTA'
    };

    return `
      <button type="submit" class="btn btn-primary btn-block ">
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
          <a href="#" class="link-primary">¿Olvidaste tu contraseña?</a>
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

  // Renderizar formulario completo
  render() {
    const fields = this.getFieldsConfig();
    const fieldsHtml = fields.map((field, index) => this.createField(field, index)).join('');
    
    const formHtml = `
      <form id="${this.formType}-form" novalidate>
        ${fieldsHtml}
        ${this.createSubmitButton()}
        ${this.createAdditionalLinks()}
      </form>
    `;

    this.container.innerHTML = formHtml;
    this.form = document.getElementById(`${this.formType}-form`);
    this.attachEventListeners();
  }

  // Mostrar error en campo
  showError(fieldId, message) {
    const field = document.getElementById(`form-${fieldId}`);
    const formOutline = field?.closest('.form-outline');
    const errorDiv = formOutline?.querySelector('.error-message');
    
    if (formOutline && errorDiv) {
      formOutline.classList.add('has-error');
      errorDiv.textContent = message;
      field.setAttribute('aria-invalid', 'true');
    }
  }

  // Limpiar error de campo
  clearError(fieldId) {
    const field = document.getElementById(`form-${fieldId}`);
    const formOutline = field?.closest('.form-outline');
    const errorDiv = formOutline?.querySelector('.error-message');
    
    if (formOutline && errorDiv) {
      formOutline.classList.remove('has-error');
      errorDiv.textContent = '';
      field.removeAttribute('aria-invalid');
    }
  }

  // Validar campo individual
  validateSingleField(fieldConfig) {
    const input = document.getElementById(`form-${fieldConfig.id}`);
    const value = input?.value || '';
    const error = this.validateField(fieldConfig, value);
    
    if (error) {
      this.showError(fieldConfig.id, error);
      return false;
    } else {
      this.clearError(fieldConfig.id);
      return true;
    }
  }

  // Validar formulario completo
  validateForm() {
    const fields = this.getFieldsConfig();
    let isValid = true;

    fields.forEach(field => {
      if (!this.validateSingleField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  // Event listeners
  attachEventListeners() {
    const fields = this.getFieldsConfig();

    // Validación en tiempo real
    fields.forEach(field => {
      const input = document.getElementById(`form-${field.id}`);
      if (input) {
        input.addEventListener('blur', () => {
          this.validateSingleField(field);
        });

        input.addEventListener('input', () => {
          if (this.errors[field.id]) {
            this.clearError(field.id);
          }
        });
      }
    });

    // Submit del formulario
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (this.validateForm()) {
        this.handleSubmit();
      }
    });
  }

  // Manejar envío del formulario
  handleSubmit() {
    const formData = new FormData(this.form);
    const data = {};
    
    formData.forEach((value, key) => {
      data[key.replace('form-', '')] = value;
    });

    // Aquí iría la lógica de envío al servidor
    console.log('Form submitted:', data);
    
    // Mostrar mensaje de éxito
    this.showSuccessMessage();
  }

  // Mostrar mensaje de éxito
  showSuccessMessage() {
    const messages = {
      login: '¡Bienvenido! Redirigiendo a página principal...',
      register: '¡Registro exitoso! Redirigiendo al login...',
      contact: '¡Mensaje enviado! Te contactaremos pronto.'
    };

    const alertHtml = `
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="fa-solid fa-circle-check"></i> ${messages[this.formType]}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;

    this.container.insertAdjacentHTML('afterbegin', alertHtml);
    
    setTimeout(() => {
      if (this.formType === 'login') {       
        
        console.log('Redirigiendo a home...');
        window.location.href = 'home.html';

        

      } else if (this.formType === 'register') {
        
        
        console.log('Redirigiendo a login...');
        window.location.href = 'login.html';
      }
    }, 2000);
  }
}






document.addEventListener('DOMContentLoaded', () => {
  const registerContainer = document.getElementById('formsType');
  
  if (registerContainer) {
    
    const path = window.location.pathname;
    let formType = 'contact';
    
    if (path.includes('login')) {
      formType = 'login';
    } else if (path.includes('register')) {
      formType = 'register';
    } else if (path.includes('contacto')) {
      formType = 'contact';
    }
    
    const formBuilder = new FormBuilder('formsType', formType);
    formBuilder.render();
  }
});