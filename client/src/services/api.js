import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants';

// Single axios instance for the whole app. No default Content-Type header is
// set here on purpose: axios auto-detects JSON for plain objects and
// multipart/form-data (with the correct boundary) for FormData bodies.
const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new CustomEvent('nova:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
