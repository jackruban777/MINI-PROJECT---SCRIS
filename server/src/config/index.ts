import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Guarantee cloud production fallbacks
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'scris_academic_risk_jwt_super_secret_key_2026',
  cookieSecret: process.env.COOKIE_SECRET || 'scris_academic_cookie_secret_key_2026',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  teacherInviteCode: process.env.TEACHER_INVITE_CODE || 'SCRIS-FACULTY-2026',
  email: {
    dryRun: process.env.SMTP_DRY_RUN !== 'false',
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'SCRIS Academic Notifications <notifications@scris.internal>',
  },
  riskWeights: {
    internalMarks: 0.35,
    pendingArrears: 0.30,
    cgpaTrend: 0.15,
    attendance: 0.15,
    missedAssessments: 0.05,
  },
  riskThresholds: {
    safeMax: 34,
    watchMax: 64,
  },
  attendanceThreshold: 75.0, // Minimum required % attendance
};
