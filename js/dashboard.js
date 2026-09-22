/* ============================================
   DASHBOARD.JS
   Carga dinámica de estadísticas, perfil y tabla
   ============================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el StorageManager está disponible
    if (!window.StorageManager) return;

    initUserProfile();
    renderDashboardStats();
    renderReservationsTable();
    initSearchFilter();
  });

  /* ============================================
     1. PERFIL DE USUARIO DINÁMICO
     ============================================ */

  function initUserProfile() {
    const currentUser = window.StorageManager.getCurrentUser();
    if (!currentUser) return;

    const name = currentUser.name || currentUser.email.split('@')[0];
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US';

    // Actualizar elementos en el Sidebar y Header
    const sidebarUserName = document.querySelector('.sidebar-user-info strong');
    const sidebarUserSub = document.querySelector('.sidebar-user-info span');
    const sidebarAvatar = document.querySelector('.sidebar-user .avatar');
    const headerAvatar = document.querySelector('.header-actions .avatar');

    if (sidebarUserName) sidebarUserName.textContent = name;
    if (sidebarUserSub) sidebarUserSub.textContent = currentUser.email;
    if (sidebarAvatar) sidebarAvatar.textContent = initials;
    if (headerAvatar) headerAvatar.textContent = initials;
  }

  /* ============================================
     2. ESTADÍSTICAS DEL DASHBOARD
     ============================================ */

  function renderDashboardStats() {
    const reservations = window.StorageManager.getReservations();
    const statValues = document.querySelectorAll('.stat-value');

    if (!statValues.length) return;

    const totalReservas = reservations.length;
    const confirmadas = reservations.filter(r => r.status === 'Confirmada').length;
    
    // Si hay datos en localStorage, actualizamos los contadores visuales
    if (totalReservas > 0) {
      if (statValues[0]) statValues[0].textContent = totalReservas;
      if (statValues[1]) statValues[1].textContent = confirmadas;
    }
  }

  /* ============================================
     3. RENDERING DE TABLA DE RESERVAS
     ============================================ */

  function renderReservationsTable() {
    const tbody = document.querySelector('.data-table tbody');
    if (!tbody) return;

    const savedReservations = window.StorageManager.getReservations();

    // Si no hay datos guardados aún, mantenemos la tabla limpia o con el estado inicial
    if (savedReservations.length === 0) return;

    tbody.innerHTML = ''; // Limpiar filas estáticas de ejemplo

    savedReservations.slice(-5).reverse().forEach(res => {
      const tr = document.createElement('tr');

      const name = res.userId || 'Cliente Demo';
      const initials = name.substring(0, 2).toUpperCase();
      const statusClass = res.status === 'Confirmada' ? 'badge-success' : 'badge-warning';

      tr.innerHTML = `
        <td>
          <div class="cell-user">
            <div class="avatar" style="width:32px;height:32px;font-size:.75rem;">${initials}</div>
            <strong>${name}</strong>
          </div>
        </td>
        <td>${res.service || 'Servicio General'} (${res.category || 'Módulo'})</td>
        <td>${res.time || '10:00'}</td>
        <td><span class="badge ${statusClass}">${res.status || 'Confirmada'}</span></td>
      `;

      tbody.appendChild(tr);
    });
  }

  /* ============================================
     4. FILTRO DE BÚSQUEDA EN TIEMPO REAL
     ============================================ */

  function initSearchFilter() {
    const searchInput = document.querySelector('.search-bar input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('.data-table tbody tr');

      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }

})();