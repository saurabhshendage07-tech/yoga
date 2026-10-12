import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginAdmin as fbLoginAdmin,
  loginUser as fbLoginUser,
  registerUser as fbRegisterUser,
  logoutUser as fbLogoutUser,
  resetPassword as fbResetPassword,
  onAuthChange
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pranaveda_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Subscribe to Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        localStorage.setItem('pranaveda_user', JSON.stringify(firebaseUser));
      } else {
        setUser(null);
        localStorage.removeItem('pranaveda_user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Standard Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const loggedUser = await fbLoginUser(email, password);
      setUser(loggedUser);
      localStorage.setItem('pranaveda_user', JSON.stringify(loggedUser));
      return loggedUser;
    } finally {
      setLoading(false);
    }
  };

  // Admin Dedicated Login
  const loginAdmin = async (email, password) => {
    setLoading(true);
    try {
      const adminUser = await fbLoginAdmin(email, password);
      setUser(adminUser);
      localStorage.setItem('pranaveda_user', JSON.stringify(adminUser));
      return adminUser;
    } finally {
      setLoading(false);
    }
  };

  // User Registration
  const register = async ({ name, email, mobile, phone, password, role = 'user' }) => {
    setLoading(true);
    try {
      const newUser = await fbRegisterUser({
        name,
        email,
        phone: phone || mobile,
        password,
        role
      });
      setUser(newUser);
      localStorage.setItem('pranaveda_user', JSON.stringify(newUser));
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await fbLogoutUser();
    } catch (err) {
      console.warn('Firebase logout notice:', err.message);
    } finally {
      setUser(null);
      localStorage.removeItem('pranaveda_user');
    }
  };

  // Reset Password
  const resetPassword = async (email) => {
    return await fbResetPassword(email);
  };

  const isAdmin = Boolean(user && user.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        loginAdmin,
        register,
        logout,
        resetPassword,
        isAdmin,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
