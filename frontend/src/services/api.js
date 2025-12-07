import axios from 'axios';

// Backend adresi (Senin sunucun 5000'de çalışıyor)
const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Her istekten önce çalışır (Interceptors)
// Eğer localStorage'da token varsa, isteğin header'ına ekler
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;