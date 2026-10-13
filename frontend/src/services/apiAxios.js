import axios from 'axios';

// Configuración base de Axios para conectar con el backend
const apiAxios = axios.create({
  baseURL: 'http://localhost:3000/api', // Cambia esta URL cuando tu backend esté desplegado
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiAxios;