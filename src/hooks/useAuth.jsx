import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('fridgit_token');
      if (storedToken) {
        setToken(storedToken);
        const res = await api.get('/auth/me');
        setUser(res.data);
      }
    } catch (error) {
      await SecureStore.deleteItemAsync('fridgit_token');
      await SecureStore.deleteItemAsync('fridgit_user');
    } finally {
      setLoading(false);
    }
  };

  const saveAuth = async (data) => {
    await SecureStore.setItemAsync('fridgit_token', data.token);
    await SecureStore.setItemAsync('fridgit_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    await saveAuth(res.data);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    await saveAuth(res.data);
    return res.data;
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('fridgit_token');
    await SecureStore.deleteItemAsync('fridgit_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      await SecureStore.setItemAsync('fridgit_user', JSON.stringify(res.data));
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!token,
        hasHousehold: !!user?.active_household_id,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
