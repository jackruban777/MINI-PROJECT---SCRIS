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

const extractUser = (res: any): User | null => {
  if (!res) return null;
  if (res.user && typeof res.user === 'object') {
    return extractUser(res.user);
  }
  if (res.data && typeof res.data === 'object') {
    return extractUser(res.data);
  }
  return res as User;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get<any>('/auth/me');
      const currentUser = extractUser(response);
      setUser(currentUser);
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
    const response = await api.post<any>('/auth/login', credentials);
    const currentUser = extractUser(response);
    if (!currentUser) {
      throw new Error('Authentication failed. No user details returned.');
    }
    setUser(currentUser);
    return currentUser;
  };

  const registerStudent = async (data: any): Promise<User> => {
    const response = await api.post<any>('/auth/register-student', data);
    const currentUser = extractUser(response);
    if (!currentUser) {
      throw new Error('Registration failed. No student details returned.');
    }
    setUser(currentUser);
    return currentUser;
  };

  const registerTeacher = async (data: any): Promise<User> => {
    const response = await api.post<any>('/auth/register-teacher', data);
    const currentUser = extractUser(response);
    if (!currentUser) {
      throw new Error('Registration failed. No teacher details returned.');
    }
    setUser(currentUser);
    return currentUser;
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
