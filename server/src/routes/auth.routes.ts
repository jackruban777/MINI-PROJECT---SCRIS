import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { generateToken, setAuthCookie, clearAuthCookie } from '../lib/jwt';
import { authenticate } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { config } from '../config';
import { EmailService } from '../lib/email';
import { StudentSampleDataService } from '../services/studentSampleDataService';

const router = Router();

// Validation Schemas
const studentRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  registerNumber: z.string().min(3, 'Register number is required').toUpperCase(),
  email: z.string().email('Valid email address is required'),
  department: z.string().min(2, 'Department is required'),
  degree: z.string().min(2, 'Degree program is required'),
  currentSemester: z.number().int().min(1).max(8),
  batchYear: z.number().int().min(2018).max(2030),
  section: z.string().default('A'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const teacherRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  staffId: z.string().min(3, 'Staff ID is required').toUpperCase(),
  email: z.string().email('Valid email address is required'),
  department: z.string().min(2, 'Department is required'),
  designation: z.string().min(2, 'Designation is required'),
  inviteCode: z.string().min(1, 'Faculty invitation code is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z.string().email('Valid email address is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']).optional(),
});

// Student Registration
router.post('/register-student', validateBody(studentRegisterSchema), async (req: Request, res: Response): Promise<void> => {
  const { name, registerNumber, email, department, degree, currentSemester, batchYear, section, password } = req.body;

  // Check unique constraints
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    res.status(409).json({
      success: false,
      error: { code: 'EMAIL_EXISTS', message: 'An account with this email address already exists.' },
    });
    return;
  }

  const existingReg = await prisma.student.findUnique({ where: { registerNumber } });
  if (existingReg) {
    res.status(409).json({
      success: false,
      error: { code: 'REGISTER_EXISTS', message: 'A student with this register number already exists.' },
    });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'STUDENT',
      department,
      studentProfile: {
        create: {
          registerNumber,
          degree,
          currentSemester,
          batchYear,
          section,
        },
      },
    },
    include: {
      studentProfile: true,
    },
  });

  // Auto-provision realistic predefined academic data so student portal is never blank
  if (user.studentProfile?.id) {
    try {
      await StudentSampleDataService.populatePredefinedData(user.studentProfile.id, 'WATCH');
    } catch (seedErr) {
      console.warn('Auto-provisioning predefined student data encountered a non-fatal warning:', seedErr);
    }
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: 'STUDENT',
    department: user.department,
    studentId: user.studentProfile?.id,
  });

  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentProfile: user.studentProfile,
      },
      token,
    },
  });
});

// Teacher Registration
router.post('/register-teacher', validateBody(teacherRegisterSchema), async (req: Request, res: Response): Promise<void> => {
  const { name, staffId, email, department, designation, inviteCode, password } = req.body;

  // Verify privileged invitation code
  if (inviteCode !== config.teacherInviteCode) {
    res.status(403).json({
      success: false,
      error: { code: 'INVALID_INVITE_CODE', message: 'Invalid faculty authorization key.' },
    });
    return;
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    res.status(409).json({
      success: false,
      error: { code: 'EMAIL_EXISTS', message: 'An account with this email address already exists.' },
    });
    return;
  }

  const existingStaff = await prisma.teacher.findUnique({ where: { staffId } });
  if (existingStaff) {
    res.status(409).json({
      success: false,
      error: { code: 'STAFF_ID_EXISTS', message: 'A faculty member with this staff ID is already registered.' },
    });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'TEACHER',
      department,
      teacherProfile: {
        create: {
          staffId,
          designation,
          department,
        },
      },
    },
    include: {
      teacherProfile: true,
    },
  });

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: 'TEACHER',
    department: user.department,
    teacherId: user.teacherProfile?.id,
  });

  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        teacherProfile: user.teacherProfile,
      },
      token,
    },
  });
});

// Login
router.post('/login', validateBody(loginSchema), async (req: Request, res: Response): Promise<void> => {
  const { email, password, role } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      studentProfile: true,
      teacherProfile: true,
    },
  });

  if (!user) {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email address or password.' },
    });
    return;
  }

  // Validate expected role if specified by the user's login portal
  if (role && user.role !== role) {
    res.status(403).json({
      success: false,
      error: {
        code: 'ROLE_MISMATCH',
        message: `This account is registered as a ${user.role}. Please use the ${user.role.toLowerCase()} portal to sign in.`,
      },
    });
    return;
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email address or password.' },
    });
    return;
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role as any,
    department: user.department,
    studentId: user.studentProfile?.id,
    teacherId: user.teacherProfile?.id,
  });

  setAuthCookie(res, token);

  // Audit log login
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      entityType: 'User',
      entityId: user.id,
      action: 'LOGIN',
      metadata: JSON.stringify({ ip: req.ip, userAgent: req.headers['user-agent'] }),
    },
  });

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentProfile: user.studentProfile,
        teacherProfile: user.teacherProfile,
      },
      token,
    },
  });
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  clearAuthCookie(res);
  res.status(200).json({
    success: true,
    data: { message: 'Signed out successfully.' },
  });
});

// Current User Me
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      createdAt: true,
      studentProfile: {
        include: {
          advisor: {
            include: {
              user: {
                select: { name: true, email: true },
              },
            },
          },
        },
      },
      teacherProfile: true,
    },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User record not found.' },
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
});

// Forgot Password Flow
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, error: { message: 'Email address is required.' } });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Return honest feedback
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'No registered account found with that email address.' },
    });
    return;
  }

  // Send password recovery email simulation / dry run
  const resetToken = Math.random().toString(36).substring(2, 10).toUpperCase();
  await EmailService.sendEmail({
    to: email,
    subject: 'SCRIS Academic Portal — Password Reset Verification',
    emailType: 'PASSWORD_RESET',
    eventKey: `pwd-reset-${user.id}-${Date.now()}`,
    text: `Your password reset verification code is: ${resetToken}. This code is valid for 15 minutes.`,
    html: `<p>Your password reset verification code is: <strong>${resetToken}</strong></p>`,
  });

  res.status(200).json({
    success: true,
    data: {
      message: 'Password reset instructions have been dispatched to your email.',
      // In dev mode provide the simulated token for instant testing convenience
      simulatedCode: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    },
  });
});

export default router;
