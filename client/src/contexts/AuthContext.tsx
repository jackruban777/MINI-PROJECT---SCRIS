import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, UserRole } from '../types';
import { api, ApiError, setAuthToken, clearAuthToken, getAuthToken } from '../lib/api';

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

const decodeJwtPayload = (token: string): any | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const extractUser = (res: any): User | null => {
  if (!res) return null;

  // If a JWT token string was passed directly
  if (typeof res === 'string' && res.includes('.')) {
    const payload = decodeJwtPayload(res);
    if (payload?.userId || payload?.id) {
      const uid = payload.userId || payload.id;
      return {
        id: uid,
        name: payload.name || payload.email?.split('@')[0] || 'User',
        email: payload.email || '',
        role: (payload.role as UserRole) || 'STUDENT',
        department: payload.department || '',
        studentProfile: payload.studentId
          ? {
              id: payload.studentId,
              userId: uid,
              registerNumber: payload.registerNumber || '',
              degree: payload.degree || '',
              batchYear: 2023,
              currentSemester: 1,
              section: 'A',
            }
          : undefined,
        teacherProfile: payload.teacherId
          ? {
              id: payload.teacherId,
              userId: uid,
              staffId: payload.staffId || '',
              designation: '',
              department: payload.department || '',
            }
          : undefined,
      };
    }
    return null;
  }

  if (typeof res !== 'object') return null;

  // Case 1: Wrapped under user (e.g. { user: { id, role, ... } })
  if (res.user && typeof res.user === 'object' && res.user !== res) {
    const userFromUser = extractUser(res.user);
    if (userFromUser) return userFromUser;
  }

  // Case 2: Wrapped under data (e.g. { data: { user: ... } } or { data: { student: ... } })
  if (res.data && typeof res.data === 'object' && res.data !== res) {
    const userFromData = extractUser(res.data);
    if (userFromData) return userFromData;
  }

  // Case 3: Direct User object
  if (res.id && (res.role || res.email || res.name)) {
    return {
      id: res.id,
      name: res.name || res.email?.split('@')[0] || 'User',
      email: res.email || '',
      role: (res.role as UserRole) || (res.studentProfile || res.student ? 'STUDENT' : res.teacherProfile || res.teacher ? 'TEACHER' : 'STUDENT'),
      department: res.department || '',
      studentProfile: res.studentProfile || res.student || undefined,
      teacherProfile: res.teacherProfile || res.teacher || undefined,
    };
  }

  // Case 4: Student object returned directly or wrapped (e.g. { student: { ... } } or { studentProfile: { ... } })
  const studentObj = res.student || res.studentProfile;
  if (studentObj && typeof studentObj === 'object') {
    if (studentObj.user && typeof studentObj.user === 'object') {
      return {
        ...studentObj.user,
        role: (studentObj.user.role as UserRole) || 'STUDENT',
        studentProfile: studentObj,
      };
    }
    return {
      id: studentObj.userId || studentObj.id || res.id || 'student-user',
      name: res.name || studentObj.name || (res.email ? res.email.split('@')[0] : 'Student'),
      email: res.email || studentObj.email || '',
      role: 'STUDENT',
      department: res.department || studentObj.department || '',
      studentProfile: studentObj,
    };
  }

  // Case 5: Teacher object returned directly or wrapped
  const teacherObj = res.teacher || res.teacherProfile;
  if (teacherObj && typeof teacherObj === 'object') {
    if (teacherObj.user && typeof teacherObj.user === 'object') {
      return {
        ...teacherObj.user,
        role: (teacherObj.user.role as UserRole) || 'TEACHER',
        teacherProfile: teacherObj,
      };
    }
    return {
      id: teacherObj.userId || teacherObj.id || res.id || 'teacher-user',
      name: res.name || teacherObj.name || (res.email ? res.email.split('@')[0] : 'Faculty Member'),
      email: res.email || teacherObj.email || '',
      role: 'TEACHER',
      department: res.department || teacherObj.department || '',
      teacherProfile: teacherObj,
    };
  }

  // Case 6: Token contained inside response object
  const token = res.token || res.accessToken || res.authToken;
  if (token && typeof token === 'string' && token.includes('.')) {
    const fromToken = extractUser(token);
    if (fromToken) return fromToken;
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
    const token = response?.token || response?.data?.token;
    if (token) {
      setAuthToken(token);
    }

    let currentUser = extractUser(response);

    // Fallback 1: Query /auth/me if token or cookie session is active
    if (!currentUser && (token || getAuthToken())) {
      try {
        const meRes = await api.get<any>('/auth/me');
        currentUser = extractUser(meRes);
      } catch (err) {
        console.warn('Fallback /auth/me lookup after login failed:', err);
      }
    }

    // Fallback 2: Decode token payload directly
    if (!currentUser && token) {
      currentUser = extractUser(token);
    }

    if (!currentUser) {
      throw new Error('Authentication failed. No user details returned.');
    }

    setUser(currentUser);
    return currentUser;
  };

  const registerStudent = async (data: any): Promise<User> => {
    const response = await api.post<any>('/auth/register-student', data);
    const token = response?.token || response?.data?.token;
    if (token) {
      setAuthToken(token);
    }

    let currentUser = extractUser(response);

    // Fallback 1: Query /auth/me with the active token or session cookie
    if (!currentUser && (token || getAuthToken())) {
      try {
        const meResponse = await api.get<any>('/auth/me');
        currentUser = extractUser(meResponse);
      } catch (meErr) {
        console.warn('Post-registration /auth/me fallback encountered error:', meErr);
      }
    }

    // Fallback 2: Decode token payload directly
    if (!currentUser && token) {
      const payload = decodeJwtPayload(token);
      if (payload?.userId) {
        currentUser = {
          id: payload.userId,
          name: data?.name || payload.email?.split('@')[0] || 'Student',
          email: payload.email || data?.email || '',
          role: 'STUDENT',
          department: payload.department || data?.department || '',
          studentProfile: {
            id: payload.studentId || 'student-profile-' + payload.userId,
            userId: payload.userId,
            registerNumber: data?.registerNumber || '',
            degree: data?.degree || '',
            batchYear: data?.batchYear || 2023,
            currentSemester: data?.currentSemester || 1,
            section: data?.section || 'A',
          },
        };
      }
    }

    // Fallback 3: Synthesize from submitted form registration data
    if (!currentUser && data?.email) {
      currentUser = {
        id: response?.id || response?.data?.id || 'reg-' + Date.now(),
        name: data.name || 'Student',
        email: data.email,
        role: 'STUDENT',
        department: data.department || '',
        studentProfile: {
          id: response?.studentId || response?.data?.studentId || 'sp-' + Date.now(),
          userId: response?.id || 'reg-' + Date.now(),
          registerNumber: data.registerNumber || '',
          degree: data.degree || '',
          batchYear: data.batchYear || 2023,
          currentSemester: data.currentSemester || 1,
          section: data.section || 'A',
        },
      };
    }

    if (!currentUser) {
      throw new Error('Registration failed. No student details returned.');
    }

    setUser(currentUser);
    return currentUser;
  };

  const registerTeacher = async (data: any): Promise<User> => {
    const response = await api.post<any>('/auth/register-teacher', data);
    const token = response?.token || response?.data?.token;
    if (token) {
      setAuthToken(token);
    }

    let currentUser = extractUser(response);

    // Fallback 1: Query /auth/me with the active token or session cookie
    if (!currentUser && (token || getAuthToken())) {
      try {
        const meResponse = await api.get<any>('/auth/me');
        currentUser = extractUser(meResponse);
      } catch (meErr) {
        console.warn('Post-registration /auth/me fallback encountered error:', meErr);
      }
    }

    // Fallback 2: Decode token payload directly
    if (!currentUser && token) {
      const payload = decodeJwtPayload(token);
      if (payload?.userId) {
        currentUser = {
          id: payload.userId,
          name: data?.name || payload.email?.split('@')[0] || 'Faculty Member',
          email: payload.email || data?.email || '',
          role: 'TEACHER',
          department: payload.department || data?.department || '',
          teacherProfile: {
            id: payload.teacherId || 'teacher-profile-' + payload.userId,
            userId: payload.userId,
            staffId: data?.staffId || '',
            designation: data?.designation || '',
            department: payload.department || data?.department || '',
          },
        };
      }
    }

    // Fallback 3: Synthesize from submitted form registration data
    if (!currentUser && data?.email) {
      currentUser = {
        id: response?.id || response?.data?.id || 'reg-teacher-' + Date.now(),
        name: data.name || 'Faculty Member',
        email: data.email,
        role: 'TEACHER',
        department: data.department || '',
        teacherProfile: {
          id: response?.teacherId || response?.data?.teacherId || 'tp-' + Date.now(),
          userId: response?.id || 'reg-teacher-' + Date.now(),
          staffId: data.staffId || '',
          designation: data.designation || '',
          department: data.department || '',
        },
      };
    }

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
