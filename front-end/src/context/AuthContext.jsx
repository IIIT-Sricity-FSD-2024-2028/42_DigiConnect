// src/context/AuthContext.jsx
import React, { createContext, useContext, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout as reduxLogout, setSession, updateUserLocal } from '../store/slices/authSlice';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const dispatch = useAppDispatch();
  const { user, role, isLoggedIn, loading, error } = useAppSelector((state) => state.auth);

  const login = useCallback(
    (sessionData) => {
      dispatch(setSession(sessionData));
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch(reduxLogout());
  }, [dispatch]);

  const updateUser = useCallback(
    (updatedData) => {
      dispatch(updateUserLocal(updatedData));
    },
    [dispatch]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        role: role || user?.role?.toLowerCase() || '',
        isLoggedIn,
        loading,
        error,
        login,
        logout,
        updateUser,
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

