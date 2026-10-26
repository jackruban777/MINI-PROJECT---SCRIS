import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../lib/jwt';
import { prisma } from '../lib/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & {
        dbUser?: any;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token = req.cookies?.scris_auth_token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token missing. Please sign in.',
        },
      });
      return;
    }

    const payload = verifyToken(token);

    // Verify user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        studentProfile: true,
        teacherProfile: true,
      },
    });

    if (!dbUser) {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'The account associated with this session no longer exists.',
        },
      });
      return;
    }

    req.user = {
      ...payload,
      studentId: dbUser.studentProfile?.id,
      teacherId: dbUser.teacherProfile?.id,
      dbUser,
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Your session has expired or is invalid. Please sign in again.',
      },
    });
  }
};
