// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // [State] Read initial user from localStorage
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('DigiConnect_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // [Hooks / useEffect] Synchronize state with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('DigiConnect_session', JSON.stringify(user));
      localStorage.setItem('active_role', user.role || 'citizen');
    } else {
      localStorage.removeItem('DigiConnect_session');
      localStorage.removeItem('active_role');
      localStorage.removeItem('current_user');
    }
  }, [user]);

  const login = (sessionData) => {
    setUser(sessionData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role?.toLowerCase() || '',
        isLoggedIn: !!user,
        login,
        logout,
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
