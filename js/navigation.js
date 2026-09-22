/* ============================================
   NAVIGATION.JS
   Navbar, menú móvil, scroll y control de rutas
   ============================================ */

(function () {
  'use strict';

  /* ============================================
     CONTROL DE ACCESO Y UI SEGÚN SESIÓN
     ============================================ */

  function setupAuthNavigation() {
    if (!window.StorageManager) return;

    const currentUser = window.StorageManager.getCurrentUser();
    const currentPath = window.location.pathname.toLowerCase();

    // Rutas protegidas (requieren haber iniciado sesión)
    const protectedPages = ['dashboard.html', 'reservas.html'];
    // Rutas solo para visitantes (no autenticados)
    const guestOnlyPages = ['login.html', 'registro.html'];

    const isProtected = protectedPages.some(page => currentPath.endsWith(page));
    const isGuestOnly = guestOnlyPages.some(page => currentPath.endsWith(page));

    // Guard de Navegación
    if (isProtected && !currentUser) {
      window.location.href = 'login.html';
      return;
    }

    if (isGuestOnly && currentUser) {
      window.location.href = 'dashboard.html';
      return;
    }

    // Actualización dinámica de elementos visuales del Nav
    updateNavUI(currentUser);
  }

  function updateNavUI(currentUser) {
    const navAuthContainer = document.getElementById('navAuthContainer');
    const mobileAuthContainer = document.getElementById('mobileAuthContainer');

    if (!navAuthContainer && !mobileAuthContainer) return;

    let authHTML = '';

    if (currentUser) {
      const displayName = currentUser.name || currentUser.email.split('@')[0];
      authHTML = `
        <span class="user-greeting">Hola, <strong>${displayName}</strong></span>
        <a href="dashboard.html" class="btn btn-outline btn-sm">Dashboard</a>
        <button id="logoutBtn" class="btn btn-primary btn-sm">Cerrar Sesión</button>
      `;
    } else {
      authHTML = `
        <a href="login.html" class="btn btn-outline btn-sm">Iniciar Sesión</a>
        <a href="registro.html" class="btn btn-primary btn-sm">Registrarse</a>
      `;
    }

    if (navAuthContainer) navAuthContainer.innerHTML = authHTML;
    if (mobileAuthContainer) mobileAuthContainer.innerHTML = authHTML;

    // Listener para el botón de logout dinámico
    document.querySelectorAll('#logoutBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.StorageManager.logout();
        if (window.ToastManager) {
          window.ToastManager.show('Sesión cerrada correctamente.', 'info');
        }
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      });
    });
  }

  /* ============================================
     EVENTOS DE NAVEGACIÓN Y MENÚ
     ============================================ */

  document.addEventListener('DOMContentLoaded', () => {
    // Ejecutar verificación de sesión y renderizado de Nav
    setupAuthNavigation();

    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuOverlay = document.getElementById('menuOverlay');

    /* ============================================
       EFECTO SCROLL NAVBAR
       ============================================ */

    function handleScroll() {
      if (!navbar) return;
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    /* ============================================
       MENÚ MÓVIL
       ============================================ */

    function openMenu() {
      navToggle?.classList.add('active');
      navToggle?.setAttribute('aria-expanded', 'true');
      mobileMenu?.classList.add('open');
      mobileMenu?.setAttribute('aria-hidden', 'false');
      menuOverlay?.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      navToggle?.classList.remove('active');
      navToggle?.setAttribute('aria-expanded', 'false');
      mobileMenu?.classList.remove('open');
      mobileMenu?.setAttribute('aria-hidden', 'true');
      menuOverlay?.classList.remove('open');
      document.body.style.overflow = '';
    }

    navToggle?.addEventListener('click', () => {
      if (mobileMenu?.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    menuOverlay?.addEventListener('click', closeMenu);

    // Cerrar al hacer click en un enlace del menú móvil
    mobileMenu?.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    /* ============================================
       SCROLL SUAVE PARA ANCLAS
       ============================================ */

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const offset = 80;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  });
})();