import nodemailer from 'nodemailer';
import { prisma } from './prisma';
import { config } from '../config';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  emailType: string;
  eventKey?: string;
  cooldownHours?: number;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  private static getTransporter(): nodemailer.Transporter | null {
    if (this.transporter) return this.transporter;

    if (config.email.host && config.email.user) {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port === 465,
        auth: {
          user: config.email.user,
          pass: config.email.pass,
        },
      });
      return this.transporter;
    }
    return null;
  }

  /**
   * Send academic notification email with deduplication and logging
   */
  public static async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; status: string; logId: string }> {
    const { to, subject, html, text, emailType, eventKey, cooldownHours = 24 } = options;

    // Deduplication and cooldown check
    if (eventKey) {
      const cutoffTime = new Date(Date.now() - cooldownHours * 60 * 60 * 1000);
      const existingLog = await prisma.emailLog.findFirst({
        where: {
          recipient: to,
          eventKey: eventKey,
          sentAt: { gte: cutoffTime },
          status: { in: ['SENT', 'DRY_RUN'] },
        },
      });

      if (existingLog) {
        return {
          success: true,
          status: 'SKIPPED_DEDUPLICATION',
          logId: existingLog.id,
        };
      }
    }

    const transporter = this.getTransporter();
    const isDryRun = config.email.dryRun || !transporter;

    if (isDryRun) {
      const log = await prisma.emailLog.create({
        data: {
          recipient: to,
          emailType,
          eventKey,
          status: 'DRY_RUN',
          errorMessage: 'Email delivery logged in dry-run mode (SMTP unconfigured or dry-run enabled).',
          attemptCount: 1,
        },
      });

      return {
        success: true,
        status: 'DRY_RUN',
        logId: log.id,
      };
    }

    try {
      await transporter.sendMail({
        from: config.email.from,
        to,
        subject,
        html,
        text,
      });

      const log = await prisma.emailLog.create({
        data: {
          recipient: to,
          emailType,
          eventKey,
          status: 'SENT',
          attemptCount: 1,
        },
      });

      return {
        success: true,
        status: 'SENT',
        logId: log.id,
      };
    } catch (err: any) {
      const log = await prisma.emailLog.create({
        data: {
          recipient: to,
          emailType,
          eventKey,
          status: 'FAILED',
          errorMessage: err.message || 'SMTP delivery failed',
          attemptCount: 1,
        },
      });

      return {
        success: false,
        status: 'FAILED',
        logId: log.id,
      };
    }
  }

  /**
   * Template for academic risk notification
   */
  public static generateRiskAlertTemplate(studentName: string, category: string, score: number, explanation: string): { html: string; text: string } {
    const text = `
Dear ${studentName},

This is an academic notification from SCRIS regarding your course progress.
Academic Status: ${category} (Risk Index: ${score}/100)
Details: ${explanation}

Please log in to your SCRIS Student Portal to review your academic recommendations and upcoming milestones.

Regards,
SCRIS Academic Monitoring System
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #F8FAFC; color: #0F172A; margin: 0; padding: 24px; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; }
    .header { background-color: #1E3A5F; padding: 24px; text-align: center; color: #FFFFFF; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
    .content { padding: 32px 24px; }
    .status-badge { display: inline-block; padding: 6px 14px; border-radius: 4px; font-weight: 600; font-size: 14px; margin-bottom: 16px; background-color: #EFF6FF; color: #1E40AF; border: 1px solid #BFDBFE; }
    .explanation { background-color: #F8FAFC; border-left: 4px solid #2563EB; padding: 14px; margin: 18px 0; font-size: 14px; color: #334155; }
    .footer { background-color: #F8FAFC; padding: 18px 24px; font-size: 12px; color: #64748B; text-align: center; border-top: 1px solid #E2E8F0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SCRIS Academic Progress Alert</h1>
    </div>
    <div class="content">
      <p>Dear <strong>${studentName}</strong>,</p>
      <p>This is an automated academic update regarding your course completion trajectory.</p>
      <div class="status-badge">
        Risk Category: ${category} &bull; Score: ${score}/100
      </div>
      <div class="explanation">
        ${explanation}
      </div>
      <p>Please log in to your Student Portal to view detailed subject focus recommendations and schedule an advisory appointment if necessary.</p>
    </div>
    <div class="footer">
      This is an automated institutional notification from the Student Course Completion Risk and Intervention System.
    </div>
  </div>
</body>
</html>
    `.trim();

    return { html, text };
  }
}
