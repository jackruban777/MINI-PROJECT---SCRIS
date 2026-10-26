import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middlewares/errorHandler';

// Route imports
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import teacherRoutes from './routes/teacher.routes';
import reportRoutes from './routes/report.routes';
import systemRoutes from './routes/system.routes';
import importRoutes from './routes/import.routes';

const app = express();

// Security and Request Parsing
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);
app.use(cookieParser(config.cookieSecret));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter for authentication endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per window
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Mount Routes under /api/v1
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1/teacher', teacherRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/system', systemRoutes);
app.use('/api/v1/import', importRoutes);

// Root Welcome & API Discovery
app.get('/', (req, res) => {
  res.json({
    name: 'SCRIS API — Student Course Completion Risk and Intervention System',
    version: '1.0.0',
    documentation: '/api/v1/system/health',
    status: 'ONLINE',
  });
});

// Central Error Handler
app.use(errorHandler);

// Global process error handlers
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  const host = '0.0.0.0';
  app.listen(config.port, host, () => {
    console.log(`=======================================================`);
    console.log(`🎓 SCRIS Academic Risk & Intervention Backend API`);
    console.log(`🚀 Server listening on ${host}:${config.port}`);
    console.log(`📡 Health endpoint: /api/v1/system/health`);
    console.log(`📧 Notification mode: ${config.email.dryRun ? 'Dry-Run (Logged to DB)' : 'Live SMTP'}`);
    console.log(`=======================================================`);
  });
}

export default app;
