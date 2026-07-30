import api from './api';
import { TOKEN_KEY, USER_KEY } from '../utils/constants';

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  if (data?.token) {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user ?? data));
  }
  return data;
}

export async function register(payload) {
  const { data } = await api.post('/auth/register', payload);
  if (data?.token) {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user ?? data));
  }
  return data;
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data?.user ?? data;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
