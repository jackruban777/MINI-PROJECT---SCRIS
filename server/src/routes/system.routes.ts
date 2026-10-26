import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { EmailService } from '../lib/email';
import { config } from '../config';

const router = Router();

// 1. Health Endpoint
router.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    // Quick DB ping
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'healthy',
      application: 'SCRIS — Student Course Completion Risk and Intervention System',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: 'connected',
      emailMode: config.email.dryRun ? 'dry-run' : 'live-smtp',
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message,
    });
  }
});

// 2. Email Test Endpoint
router.post('/test-email', async (req: Request, res: Response): Promise<void> => {
  const { recipient = 'faculty.test@scris.internal' } = req.body;

  const result = await EmailService.sendEmail({
    to: recipient,
    subject: 'SCRIS Notification System — Operational Verification',
    emailType: 'SYSTEM_VERIFICATION',
    text: 'This is a test notification verifying the SCRIS notification dispatch pipeline.',
    html: '<p>This is a test notification verifying the <strong>SCRIS</strong> notification dispatch pipeline.</p>',
  });

  res.status(200).json({
    success: true,
    data: {
      result,
      mode: config.email.dryRun ? 'dry-run (logged to database)' : 'live SMTP',
      message: 'Test email pipeline executed and logged to audit table.',
    },
  });
});

// 3. Email Logs
router.get('/email-logs', async (req: Request, res: Response): Promise<void> => {
  const logs = await prisma.emailLog.findMany({
    orderBy: { sentAt: 'desc' },
    take: 20,
  });

  res.status(200).json({
    success: true,
    data: { logs },
  });
});

export default router;
