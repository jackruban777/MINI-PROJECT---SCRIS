import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, UserRole } from '../types';
import { api, ApiError } from '../lib/api';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string; role?: UserRole }) => Promise<User>;
  registerStudent: (data: any) => Promise<User>;
  registerTeacher: (data: any) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get<{ user: User }>('/auth/me');
      setUser(response.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: { email: string; password: string; role?: UserRole }): Promise<User> => {
    const response = await api.post<{ user: User }>('/auth/login', credentials);
    setUser(response.user);
    return response.user;
  };

  const registerStudent = async (data: any): Promise<User> => {
    const response = await api.post<{ user: User }>('/auth/register-student', data);
    setUser(response.user);
    return response.user;
  };

  const registerTeacher = async (data: any): Promise<User> => {
    const response = await api.post<{ user: User }>('/auth/register-teacher', data);
    setUser(response.user);
    return response.user;
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        registerStudent,
        registerTeacher,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
