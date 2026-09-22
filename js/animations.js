/* ============================================
   ANIMATIONS.JS
   Scroll reveal, microinteracciones y flujo de reservas
   ============================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {

    /* ============================================
       SCROLL REVEAL
       ============================================ */

    const revealElements = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window && revealElements.length) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      });

      revealElements.forEach(el => observer.observe(el));
    } else {
      // Fallback: mostrar todo
      revealElements.forEach(el => el.classList.add('visible'));
    }

    /* ============================================
       FLUJO DE RESERVAS (multi-paso)
       ============================================ */

    const bookingPanels = document.querySelectorAll('.booking-panel');
    if (bookingPanels.length) {
      initBookingFlow();
    }

    /* ============================================
       MAPA DE MESAS (Restaurante)
       ============================================ */

    const tableNodes = document.querySelectorAll('.table-node');
    if (tableNodes.length) {
      initTableMap();
    }

  });

  /* ============================================
     FLUJO DE RESERVAS CON PERSISTENCIA
     ============================================ */

  function initBookingFlow() {
    const panels = document.querySelectorAll('.booking-panel');
    const steps = document.querySelectorAll('.booking-step');
    const connectors = document.querySelectorAll('.booking-step-connector');

    // Determinar el negocio según el archivo HTML actual
    const pageName = window.location.pathname.split('/').pop().replace('.html', '') || 'general';

    const state = {
      category: pageName,
      service: null,
      date: null,
      time: null
    };

    function goToStep(stepNumber) {
      // Paneles: cambiar clase active Y forzar propiedad display
      panels.forEach(p => {
        const isCurrent = parseInt(p.dataset.panel) === stepNumber;
        p.classList.toggle('active', isCurrent);
        p.style.display = isCurrent ? 'block' : 'none';
      });

      // Steps
      steps.forEach(s => {
        const num = parseInt(s.dataset.step);
        s.classList.toggle('active', num === stepNumber);
        s.classList.toggle('completed', num < stepNumber);
      });

      // Conectores
      connectors.forEach((c, i) => {
        const stepIdx = i + 1;
        c.style.background = stepIdx < stepNumber
          ? 'var(--color-primary)'
          : 'var(--color-border)';
      });

      // Scroll suave hacia arriba en el contenedor
      const content = document.querySelector('.booking-content');
      if (content) {
        const top = content.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }

    // Botones "Continuar"
    document.querySelectorAll('[data-next]').forEach(btn => {
      btn.addEventListener('click', () => {
        const currentPanel = parseInt(btn.closest('.booking-panel')?.dataset.panel);
        const next = parseInt(btn.dataset.next);

        // Si estamos pasando al último paso (Confirmación/Final)
        if (next === 4 || currentPanel === 3) {
          saveCurrentBooking(state);
        }

        goToStep(next);
      });
    });

    // Botones "Atrás"
    document.querySelectorAll('[data-prev]').forEach(btn => {
      btn.addEventListener('click', () => {
        const prev = parseInt(btn.dataset.prev);
        goToStep(prev);
      });
    });

    // Selección por Pasos
    panels.forEach(panel => {
      const stepNum = parseInt(panel.dataset.panel);

      if (stepNum === 1) {
        const cards = panel.querySelectorAll('.select-card');
        const nextBtn = panel.querySelector('[data-next]');

        cards.forEach(card => {
          card.addEventListener('click', () => {
            cards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            state.service = card.dataset.value || card.querySelector('h3, h4')?.textContent.trim();
            if (nextBtn) nextBtn.disabled = false;
          });
        });
      }

      if (stepNum === 2) {
        const cards = panel.querySelectorAll('.select-card, input[type="date"]');
        const nextBtn = panel.querySelector('[data-next]');

        cards.forEach(card => {
          const eventType = card.tagName === 'INPUT' ? 'change' : 'click';
          card.addEventListener(eventType, () => {
            if (card.tagName !== 'INPUT') {
              cards.forEach(c => c.classList.remove('selected'));
              card.classList.add('selected');
              state.date = card.dataset.value;
            } else {
              state.date = card.value;
            }
            if (nextBtn) nextBtn.disabled = false;
          });
        });
      }

      if (stepNum === 3) {
        const slots = panel.querySelectorAll('.time-slot:not(:disabled)');
        const nextBtn = panel.querySelector('[data-next]');

        slots.forEach(slot => {
          slot.addEventListener('click', () => {
            panel.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
            state.time = slot.textContent.trim();
            if (nextBtn) nextBtn.disabled = false;
          });
        });
      }
    });

    // Guardar en StorageManager y actualizar resumen
    function saveCurrentBooking(bookingData) {
      if (window.StorageManager) {
        window.StorageManager.addReservation(bookingData);
      }

      // Actualizar resumen en la pantalla final si existen los contenedores
      const summaryService = document.getElementById('summaryService');
      const summaryDate = document.getElementById('summaryDate');
      const summaryTime = document.getElementById('summaryTime');

      if (summaryService) summaryService.textContent = bookingData.service || 'Servicio';
      if (summaryDate) summaryDate.textContent = bookingData.date || 'Fecha seleccionada';
      if (summaryTime) summaryTime.textContent = bookingData.time || 'Hora seleccionada';

      if (window.ToastManager) {
        window.ToastManager.show('Reserva registrada en tu panel.', 'success');
      }
    }

    // Botón "Nueva reserva"
    const newBtn = document.getElementById('newBooking');
    newBtn?.addEventListener('click', () => {
      document.querySelectorAll('.select-card').forEach(c => c.classList.remove('selected'));
      document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      document.querySelectorAll('[data-next]').forEach(b => b.disabled = true);
      state.service = state.date = state.time = null;

      goToStep(1);
      if (window.ToastManager) {
        window.ToastManager.show('Listo para una nueva reserva.', 'info');
      }
    });
  }

  /* ============================================
     MAPA DE MESAS
     ============================================ */

  function initTableMap() {
    const nodes = document.querySelectorAll('.table-node.available, .table-node.selected');
    const label = document.getElementById('mesaSeleccionada');
    const reservarBtn = document.getElementById('reservarMesa');
    let selectedTableNum = null;

    nodes.forEach(node => {
      node.addEventListener('click', () => {
        if (node.classList.contains('occupied')) return;

        document.querySelectorAll('.table-node').forEach(n => {
          if (!n.classList.contains('occupied')) {
            n.classList.remove('selected');
            n.classList.add('available');
          }
        });

        node.classList.remove('available');
        node.classList.add('selected');

        selectedTableNum = node.dataset.table;
        const zone = parseInt(selectedTableNum) > 8 ? 'Terraza' : 'Principal';
        if (label) label.textContent = `M${selectedTableNum} · ${zone}`;
      });
    });

    reservarBtn?.addEventListener('click', () => {
      if (!selectedTableNum) {
        if (window.ToastManager) window.ToastManager.show('Por favor selecciona una mesa disponible.', 'error');
        return;
      }

      const activeNode = document.querySelector(`.table-node[data-table="${selectedTableNum}"]`);
      if (activeNode) {
        activeNode.classList.remove('selected', 'available');
        activeNode.classList.add('occupied');
      }

      if (window.StorageManager) {
        window.StorageManager.addReservation({
          category: 'restaurante',
          service: `Mesa #${selectedTableNum}`,
          date: new Date().toLocaleDateString(),
          time: 'Turno Actual'
        });
      }

      if (window.ToastManager) {
        window.ToastManager.show(`Mesa ${selectedTableNum} reservada con éxito.`, 'success');
      }

      if (label) label.textContent = 'Ninguna mesa seleccionada';
      selectedTableNum = null;
    });
  }

})();