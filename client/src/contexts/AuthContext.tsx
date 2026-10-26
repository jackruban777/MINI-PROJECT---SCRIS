import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, UserRole } from '../types';
import { api, ApiError, setAuthToken, clearAuthToken } from '../lib/api';

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
  if (!res || typeof res !== 'object') return null;

  // Case 1: Wrapped under user (e.g. { user: { id, role, ... } })
  if (res.user && typeof res.user === 'object' && (res.user.id || res.user.role || res.user.email)) {
    return res.user as User;
  }
  // Case 2: Wrapped under data (e.g. { data: { user: { id, role, ... } } })
  if (res.data && typeof res.data === 'object') {
    if (res.data.user && typeof res.data.user === 'object' && (res.data.user.id || res.data.user.role)) {
      return res.data.user as User;
    }
    if (res.data.id && (res.data.role || res.data.email)) {
      return res.data as User;
    }
  }
  // Case 3: Direct User object (e.g. { id, role, email, ... })
  if (res.id && (res.role || res.email)) {
    return res as User;
  }

  // Fallback: Check if response has studentProfile or teacherProfile
  if (res.studentProfile || res.teacherProfile) {
    return res as User;
  }

  return null;
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
    if (response?.token) {
      setAuthToken(response.token);
    }
    const currentUser = extractUser(response);
    if (!currentUser) {
      throw new Error('Authentication failed. No user details returned.');
    }
    setUser(currentUser);
    return currentUser;
  };

  const registerStudent = async (data: any): Promise<User> => {
    const response = await api.post<any>('/auth/register-student', data);
    if (response?.token) {
      setAuthToken(response.token);
    }
    const currentUser = extractUser(response);
    if (!currentUser) {
      throw new Error('Registration failed. No student details returned.');
    }
    setUser(currentUser);
    return currentUser;
  };

  const registerTeacher = async (data: any): Promise<User> => {
    const response = await api.post<any>('/auth/register-teacher', data);
    if (response?.token) {
      setAuthToken(response.token);
    }
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
      clearAuthToken();
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
