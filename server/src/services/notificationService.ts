import { prisma } from '../lib/prisma';
import { EmailService } from '../lib/email';
import { AcademicRiskEngine } from './riskEngine';

export interface NotificationPayload {
  userId: string;
  type: 'ACADEMIC_ALERT' | 'EXAM_SCHEDULE' | 'RISK_CHANGE' | 'INTERVENTION_UPDATE' | 'PROGRESS_REPORT';
  title: string;
  message: string;
  eventKey?: string; // Deduplication identifier
  sendEmail?: boolean;
  emailRecipient?: string;
  emailSubject?: string;
}

export class NotificationService {
  /**
   * Dispatch an in-app notification with optional email and deduplication
   */
  public static async sendNotification(payload: NotificationPayload): Promise<{ inAppId?: string; deduplicated: boolean }> {
    // 1. Check deduplication if eventKey is provided
    if (payload.eventKey) {
      const existingEmail = await prisma.emailLog.findFirst({
        where: { eventKey: payload.eventKey },
      });
      if (existingEmail) {
        return { deduplicated: true };
      }
    }

    // 2. Create In-App Notification
    const notif = await prisma.notification.create({
      data: {
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
      },
    });

    // 3. Optional Email delivery (dry-run or live SMTP)
    if (payload.sendEmail && payload.emailRecipient) {
      await EmailService.sendEmail({
        to: payload.emailRecipient,
        subject: payload.emailSubject || payload.title,
        text: payload.message,
        html: `<div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #2563eb;">${payload.title}</h2>
          <p>${payload.message}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #64748b;">SCRIS Academic Intervention System &bull; Confidential</p>
        </div>`,
        emailType: payload.type,
        eventKey: payload.eventKey,
      });
    }

    return { inAppId: notif.id, deduplicated: false };
  }

  /**
   * Evaluates all students in department or university, checks for risk category changes,
   * and dispatches alert notifications automatically.
   */
  public static async runScheduledRiskReassessment(departmentScope?: string): Promise<{
    assessedCount: number;
    categoryChangesCount: number;
    notificationsSent: number;
  }> {
    const studentWhere = departmentScope ? { user: { department: departmentScope } } : {};
    const students = await prisma.student.findMany({
      where: studentWhere,
      include: {
        user: true,
        riskSnapshots: {
          orderBy: { calculatedAt: 'desc' },
          take: 1,
        },
      },
    });

    let assessedCount = 0;
    let categoryChangesCount = 0;
    let notificationsSent = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    for (const student of students) {
      assessedCount++;
      const currentAssessment = await AcademicRiskEngine.assessStudentRisk(student.id);
      const previousSnapshot = student.riskSnapshots[0];

      // Save new risk snapshot
      await prisma.riskSnapshot.create({
        data: {
          studentId: student.id,
          semester: student.currentSemester,
          score: currentAssessment.score,
          category: currentAssessment.category,
          explanation: currentAssessment.explanation,
          contributingFactors: JSON.stringify(currentAssessment.factors),
          calculatedAt: new Date(),
        },
      });

      // Check for category transition (e.g. SAFE -> WATCH, WATCH -> CRITICAL)
      if (previousSnapshot && previousSnapshot.category !== currentAssessment.category) {
        categoryChangesCount++;
        const eventKey = `RISK_CHANGE_${student.id}_${todayStr}`;

        const isEscalation =
          (previousSnapshot.category === 'SAFE' && currentAssessment.category !== 'SAFE') ||
          (previousSnapshot.category === 'WATCH' && currentAssessment.category === 'CRITICAL');

        const title = isEscalation
          ? `Academic Risk Alert: Status Transitioned to ${currentAssessment.category}`
          : `Academic Risk Update: Status Improved to ${currentAssessment.category}`;

        const message = `Your academic risk profile has changed from ${previousSnapshot.category} to ${currentAssessment.category} (Score: ${currentAssessment.score}/100). Contributing factors: ${currentAssessment.explanation}`;

        const res = await this.sendNotification({
          userId: student.userId,
          type: 'RISK_CHANGE',
          title,
          message,
          eventKey,
          sendEmail: isEscalation,
          emailRecipient: student.user.email,
        });

        if (!res.deduplicated) notificationsSent++;
      }
    }

    return { assessedCount, categoryChangesCount, notificationsSent };
  }

  /**
   * Check for upcoming follow-up dates on open interventions and notify faculty
   */
  public static async sendInterventionFollowUpReminders(): Promise<number> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcomingFollowUps = await prisma.intervention.findMany({
      where: {
        status: { in: ['OPEN', 'IN_PROGRESS', 'FOLLOW_UP_REQUIRED'] },
        followUpDate: { lte: tomorrow },
      },
      include: {
        staff: { include: { user: true } },
        student: { include: { user: true } },
      },
    });

    let sentCount = 0;
    const dateKey = new Date().toISOString().split('T')[0];

    for (const item of upcomingFollowUps) {
      const eventKey = `FOLLOW_UP_REMINDER_${item.id}_${dateKey}`;
      const res = await this.sendNotification({
        userId: item.staff.userId,
        type: 'INTERVENTION_UPDATE',
        title: `Intervention Follow-up Due: ${item.student.user.name}`,
        message: `Scheduled follow-up for ${item.type} with student ${item.student.user.name} (${item.student.registerNumber}) is due on ${item.followUpDate?.toLocaleDateString()}.`,
        eventKey,
      });

      if (!res.deduplicated) sentCount++;
    }

    return sentCount;
  }
}
