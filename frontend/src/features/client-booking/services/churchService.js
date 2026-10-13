import apiAxios from '../../../services/apiAxios';

export const churchService = {
  getUpcomingEvents: async (tenantId) => {
    try {
      const response = await apiAxios.get(`/tenants/${tenantId}/church/events`);
      return response.data;
    } catch (error) {
      // Fallback a datos mock si el backend no está disponible
      return [
        {
          id: '1',
          day: '15',
          month: 'DIC',
          title: 'Culto de Navidad',
          description: 'Celebración especial con coro y mensaje navideño.',
          statusText: 'Aforo disponible',
          statusVariant: 'success',
          accentColor: '#0d9488'
        },
        {
          id: '2',
          day: '22',
          month: 'DIC',
          title: 'Encuentro de jóvenes',
          description: 'Actividad especial para jóvenes de la comunidad.',
          statusText: 'Pocos cupos',
          statusVariant: 'warning',
          accentColor: '#3b82f6'
        },
        {
          id: '3',
          day: '31',
          month: 'DIC',
          title: 'Vigilia de fin de año',
          description: 'Cerramos el año juntos con gratitud.',
          statusText: 'Aforo disponible',
          statusVariant: 'success',
          accentColor: '#0d9488'
        }
      ];
    }
  },

  getServiceSchedules: async (tenantId) => {
    try {
      const response = await apiAxios.get(`/tenants/${tenantId}/church/schedules`);
      return response.data;
    } catch (error) {
      return [
        { id: 's1', day: 'Domingo', hours: '9:00 · 11:00', description: 'Cultos principales', accentColor: '#0d9488' },
        { id: 's2', day: 'Miércoles', hours: '19:00', description: 'Estudio bíblico', accentColor: '#3b82f6' },
        { id: 's3', day: 'Viernes', hours: '18:30', description: 'Grupos pequeños', accentColor: '#0d9488' }
      ];
    }
  }
};