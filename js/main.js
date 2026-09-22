/* ============================================
   MAIN.JS
   Interacciones visuales generales y Mock Storage
   ============================================ */

(function () {
  'use strict';

  /* ============================================
     STORAGE MANAGER (Backend Falso / Mock API)
     ============================================ */

  const StorageManager = {
    KEYS: {
      USERS: 'mipymes_users',
      CURRENT_USER: 'mipymes_current_user',
      RESERVATIONS: 'mipymes_reservations'
    },

    init() {
      if (!localStorage.getItem(this.KEYS.USERS)) {
        localStorage.setItem(this.KEYS.USERS, JSON.stringify([]));
      }
      if (!localStorage.getItem(this.KEYS.RESERVATIONS)) {
        localStorage.setItem(this.KEYS.RESERVATIONS, JSON.stringify([]));
      }
    },

    getUsers() {
      return JSON.parse(localStorage.getItem(this.KEYS.USERS)) || [];
    },

    saveUser(user) {
      const users = this.getUsers();
      users.push(user);
      localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    },

    getCurrentUser() {
      return JSON.parse(localStorage.getItem(this.KEYS.CURRENT_USER)) || null;
    },

    setCurrentUser(user) {
      localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(user));
    },

    logout() {
      localStorage.removeItem(this.KEYS.CURRENT_USER);
    },

    getReservations() {
      return JSON.parse(localStorage.getItem(this.KEYS.RESERVATIONS)) || [];
    },

    addReservation(reservation) {
      const reservations = this.getReservations();
      const currentUser = this.getCurrentUser();

      const newReservation = {
        id: Date.now().toString(),
        userId: currentUser ? currentUser.email : 'guest',
        dateCreated: new Date().toISOString(),
        status: 'Confirmada',
        ...reservation
      };

      reservations.push(newReservation);
      localStorage.setItem(this.KEYS.RESERVATIONS, JSON.stringify(reservations));
      return newReservation;
    }
  };

  StorageManager.init();
  window.StorageManager = StorageManager;

  /* ============================================
     TOASTS
     ============================================ */

  const ToastManager = {
    container: null,

    init() {
      this.container = document.getElementById('toastContainer');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        this.container.id = 'toastContainer';
        this.container.setAttribute('aria-live', 'polite');
        document.body.appendChild(this.container);
      }
    },

    show(message, type = 'info', title = '') {
      if (!this.container) this.init();

      const icons = {
        success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>',
        error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
      };

      const titles = {
        success: 'Éxito',
        error: 'Error',
        info: 'Información'
      };

      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerHTML = `
        ${icons[type] || icons.info}
        <div class="toast-content">
          <strong>${title || titles[type] || ''}</strong>
          <p>${message}</p>
        </div>
        <button class="toast-close" aria-label="Cerrar notificación">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      `;

      this.container.appendChild(toast);

      const closeBtn = toast.querySelector('.toast-close');
      closeBtn.addEventListener('click', () => this.remove(toast));

      setTimeout(() => this.remove(toast), 4500);
    },

    remove(toast) {
      if (!toast.parentNode) return;
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }
  };

  window.ToastManager = ToastManager;

/* ============================================
     FORMULARIOS - Autenticación simulada
     ============================================ */

  function initForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Obtener parámetro de redirección si existe
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get('redirect') || 'dashboard.html';

    // Función auxiliar para formatear el correo como nombre si no existe uno previo
    function formatNameFromEmail(email) {
      if (!email) return 'Usuario';
      const username = email.split('@')[0];
      // Separa por puntos, guiones o números y capitaliza las palabras
      return username
        .replace(/[._-]/g, ' ')
        .replace(/[0-9]/g, '')
        .trim()
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ') || 'Usuario';
    }

    // Manejo de Login
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        if (!emailInput.value || !passwordInput.value) {
          if (window.ToastManager) window.ToastManager.show('Introduce correo y contraseña.', 'error');
          return;
        }

        const btn = document.getElementById('loginBtn');
        btn?.classList.add('loading');

        setTimeout(() => {
          btn?.classList.remove('loading');

          const users = StorageManager.getUsers();
          let user = users.find(u => u.email === emailInput.value && u.password === passwordInput.value);

          if (!user) {
            // Genera el nombre dinámico basado en tu correo en lugar de "Usuario Demo"
            const generatedName = formatNameFromEmail(emailInput.value);
            user = { 
              name: generatedName, 
              email: emailInput.value 
            };
          }

          StorageManager.setCurrentUser(user);

          if (window.ToastManager) {
            window.ToastManager.show(`Bienvenido, ${user.name}. Redirigiendo...`, 'success');
          }

          setTimeout(() => {
            window.location.href = redirectTo;
          }, 1000);
        }, 1000);
      });
    }

    // Manejo de Registro
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombreInput = document.getElementById('nombre');
        const apellidoInput = document.getElementById('apellido');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        if (!emailInput.value || !passwordInput.value) {
          if (window.ToastManager) window.ToastManager.show('Por favor llena todos los campos obligatorios.', 'error');
          return;
        }

        const btn = document.getElementById('registerBtn');
        btn?.classList.add('loading');

        setTimeout(() => {
          btn?.classList.remove('loading');

          const fullName = (nombreInput?.value || apellidoInput?.value) 
            ? `${nombreInput?.value || ''} ${apellidoInput?.value || ''}`.trim()
            : formatNameFromEmail(emailInput.value);

          const newUser = {
            id: Date.now().toString(),
            name: fullName,
            email: emailInput.value,
            password: passwordInput.value
          };

          StorageManager.saveUser(newUser);
          StorageManager.setCurrentUser(newUser);

          if (window.ToastManager) {
            window.ToastManager.show('Cuenta creada con éxito. Redirigiendo...', 'success');
          }

          setTimeout(() => {
            window.location.href = redirectTo;
          }, 1000);
        }, 1000);
      });
    }
  }

  /* ============================================
     MODAL GENÉRICO
     ============================================ */

  function initModals() {
    const modal = document.getElementById('confirmModal');
    if (!modal) return;

    const closeBtn = document.getElementById('modalClose');
    const cancelBtn = document.getElementById('modalCancel');
    const confirmBtn = document.getElementById('modalConfirm');

    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }

    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });

    confirmBtn?.addEventListener('click', () => {
      closeModal();
      ToastManager.show('Acción confirmada.', 'success');
    });

    window.openConfirmModal = (onConfirmCallback) => {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';

      if (typeof onConfirmCallback === 'function') {
        const handleConfirm = () => {
          onConfirmCallback();
          closeModal();
          confirmBtn.removeEventListener('click', handleConfirm);
        };
        confirmBtn.onclick = handleConfirm;
      }
    };
  }

  /* ============================================
     BOTONES CON FEEDBACK
     ============================================ */

  function initButtonFeedback() {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', function () {
        if (this.classList.contains('loading')) return;
        this.style.transform = 'scale(0.97)';
        setTimeout(() => { this.style.transform = ''; }, 120);
      });
    });
  }

  /* ============================================
     INICIALIZACIÓN
     ============================================ */

  document.addEventListener('DOMContentLoaded', () => {
    ToastManager.init();
    initForms();
    initModals();
    initButtonFeedback();
  });
})();