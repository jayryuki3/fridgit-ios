import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Change this to your server URL
const API_BASE_URL = 'https://your-server-ip:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('fridgit_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('fridgit_token');
      await SecureStore.deleteItemAsync('fridgit_user');
      // Navigation will handle redirect via auth state change
    }
    return Promise.reject(error);
  }
);

export default api;
