import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('parkflow_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('parkflow_token');
      const savedUser = localStorage.getItem('parkflow_user');

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Verify with /me
          const freshUser = await authApi.me();
          if (freshUser) {
            setUser(freshUser);
            localStorage.setItem('parkflow_user', JSON.stringify(freshUser));
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          // Don't immediately blow away if offline/network hiccup, but clean if 401
          if (err.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const authData = await authApi.login(username, password);
    const { token: jwtToken, ...userInfo } = authData;

    setToken(jwtToken);
    setUser(userInfo);

    localStorage.setItem('parkflow_token', jwtToken);
    localStorage.setItem('parkflow_user', JSON.stringify(userInfo));

    return userInfo;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('parkflow_token');
    localStorage.removeItem('parkflow_user');
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
