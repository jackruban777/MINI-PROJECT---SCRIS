import { prisma } from '../lib/prisma';
import { AcademicRiskEngine } from './riskEngine';

export interface CompletionProjection {
  studentId: string;
  registerNumber: string;
  name: string;
  degree: string;
  department: string;
  currentSemester: number;
  totalProgramSemesters: number; // e.g. 8
  totalDegreeCreditsRequired: number; // e.g. 160
  totalCreditsEarned: number;
  creditsRemaining: number;
  completionPercentage: number;
  pendingArrearsCount: number;
  pendingArrearsList: {
    code: string;
    name: string;
    credits: number;
    originalSemester: number;
    attempts: number;
  }[];
  pace: {
    historicalAverageCreditsPerSem: number;
    requiredAverageCreditsPerSem: number;
    progressionRate: number; // ratio of earned / attempted credits (e.g. 0.85 = 85%)
  };
  trajectory: {
    status: 'ON_TIME' | 'AT_RISK_DELAY' | 'EXTENDED_TIMELINE';
    estimatedGraduationYear: number;
    potentialDelaySemesters: number;
    projectedCompletionSemester: number;
    explanation: string;
  };
  contributingFactors: string[];
  assumptions: string[];
}

export class CompletionService {
  public static async calculateCourseCompletion(studentId: string): Promise<CompletionProjection> {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        semesterResults: {
          include: { subject: true },
        },
        arrears: {
          where: { status: 'PENDING' },
          include: { subject: true },
        },
      },
    });

    if (!student) {
      throw new Error(`Student with ID ${studentId} not found`);
    }

    // Standard institutional engineering/arts program parameters
    const totalProgramSemesters = 8;
    const totalDegreeCreditsRequired = 160;

    const { totalEarnedCredits, totalAttemptedCredits } = AcademicRiskEngine.calculateCGPA(student.semesterResults);
    const creditsRemaining = Math.max(0, totalDegreeCreditsRequired - totalEarnedCredits);
    const completionPercentage = Number(((totalEarnedCredits / totalDegreeCreditsRequired) * 100).toFixed(1));

    const pendingArrearsCount = student.arrears.length;
    const pendingArrearsList = student.arrears.map((a) => ({
      code: a.subject.code,
      name: a.subject.name,
      credits: a.subject.credits,
      originalSemester: a.originalSemester,
      attempts: a.attempts,
    }));

    // Historical Pace calculation
    const completedSemestersCount = Math.max(1, student.currentSemester - 1);
    const historicalAverageCreditsPerSem = Number((totalEarnedCredits / completedSemestersCount).toFixed(1));
    const remainingSemesters = Math.max(1, totalProgramSemesters - student.currentSemester + 1);
    const requiredAverageCreditsPerSem = Number((creditsRemaining / remainingSemesters).toFixed(1));

    const progressionRate =
      totalAttemptedCredits > 0 ? Number(((totalEarnedCredits / totalAttemptedCredits) * 100).toFixed(1)) : 100;

    // Trajectory Determination
    const contributingFactors: string[] = [];
    let potentialDelaySemesters = 0;
    let trajectoryStatus: 'ON_TIME' | 'AT_RISK_DELAY' | 'EXTENDED_TIMELINE' = 'ON_TIME';
    let explanation = '';

    if (pendingArrearsCount >= 3) {
      potentialDelaySemesters = 2;
      trajectoryStatus = 'EXTENDED_TIMELINE';
      contributingFactors.push(`High backlog accumulation: ${pendingArrearsCount} uncleared arrears`);
      contributingFactors.push(`Exceeds maximum allowable concurrent credit load (28 credits/sem)`);
      explanation = `Course completion is projected to be delayed by approximately ${potentialDelaySemesters} semester(s) unless accelerated arrear clearance is achieved in the next cycle.`;
    } else if (pendingArrearsCount > 0 || requiredAverageCreditsPerSem > historicalAverageCreditsPerSem + 5) {
      potentialDelaySemesters = 1;
      trajectoryStatus = 'AT_RISK_DELAY';
      if (pendingArrearsCount > 0) {
        contributingFactors.push(`${pendingArrearsCount} uncleared course backlog(s)`);
      }
      if (requiredAverageCreditsPerSem > historicalAverageCreditsPerSem + 4) {
        contributingFactors.push(
          `Current pace (${historicalAverageCreditsPerSem} cr/sem) is below required pace (${requiredAverageCreditsPerSem} cr/sem)`
        );
      }
      explanation = `Course completion is at risk of a 1-semester extension if pending arrears are not cleared in the immediate supplementary window.`;
    } else {
      potentialDelaySemesters = 0;
      trajectoryStatus = 'ON_TIME';
      explanation = `Student is strictly on course for graduation within the scheduled 8 semesters (${student.batchYear + 4}). Credit accumulation pace is consistent with curriculum requirements.`;
    }

    const projectedCompletionSemester = totalProgramSemesters + potentialDelaySemesters;
    const baseGraduationYear = student.batchYear + 4;
    const estimatedGraduationYear = baseGraduationYear + Math.ceil(potentialDelaySemesters / 2);

    return {
      studentId: student.id,
      registerNumber: student.registerNumber,
      name: student.user.name,
      degree: student.degree,
      department: student.user.department,
      currentSemester: student.currentSemester,
      totalProgramSemesters,
      totalDegreeCreditsRequired,
      totalCreditsEarned: totalEarnedCredits,
      creditsRemaining,
      completionPercentage,
      pendingArrearsCount,
      pendingArrearsList,
      pace: {
        historicalAverageCreditsPerSem,
        requiredAverageCreditsPerSem,
        progressionRate,
      },
      trajectory: {
        status: trajectoryStatus,
        estimatedGraduationYear,
        potentialDelaySemesters,
        projectedCompletionSemester,
        explanation,
      },
      contributingFactors:
        contributingFactors.length > 0 ? contributingFactors : ['No adverse academic indicators detected'],
      assumptions: [
        `Curriculum degree framework requires ${totalDegreeCreditsRequired} total earned credits for degree conferral.`,
        `Student maintains enrollment and attempts standard maximum 24 credits per upcoming semester.`,
        `Projection assumes pending backlogs are re-attempted and successfully cleared during the subsequent examination window.`,
        `Actual graduation timeline is subject to institutional academic council clearance and regulation norms.`,
      ],
    };
  }
}
