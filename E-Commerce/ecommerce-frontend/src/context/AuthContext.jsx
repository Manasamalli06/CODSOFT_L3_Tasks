import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        setUser(JSON.parse(userInfo));
      } catch {
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    const userData = data.data;
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    return userData;
  };

  const register = async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    const userData = data.data;
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  // Called after profile update to sync context without re-login
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('userInfo', JSON.stringify(updatedUserData));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
