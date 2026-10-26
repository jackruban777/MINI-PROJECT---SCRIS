import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { config } from '../config';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  department: string;
  studentId?: string;
  teacherId?: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
};

export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie('scris_auth_token', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie('scris_auth_token', {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/',
  });
};
