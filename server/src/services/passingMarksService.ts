import { prisma } from '../lib/prisma';

export interface CoursePassingRequirement {
  subjectId: string;
  code: string;
  name: string;
  credits: number;
  internalWeight: number; // e.g. 40%
  examWeight: number; // e.g. 60%
  overallPassingThreshold: number; // e.g. 50%
  mandatoryExamMinimum: number; // e.g. 45%
  internalAssessments: {
    type: string;
    score: number;
    maxScore: number;
    percentage: number;
  }[];
  internalMaxTotal: number;
  internalObtainedTotal: number;
  internalPercentage: number;
  internalContribution: number; // weighted marks out of internalWeight
  requiredExamMarksOutof100: number; // minimum final exam score needed
  requiredExamContribution: number; // weighted contribution needed out of examWeight
  achievable: boolean;
  margin: number; // headroom (100 - required)
  status: 'SAFE' | 'BORDERLINE' | 'CRITICAL';
  recommendation: string;
  assumptions: string[];
}

export interface StudentPassingSummary {
  studentId: string;
  semester: number;
  courses: CoursePassingRequirement[];
  overallStatus: 'ALL_ON_TRACK' | 'BORDERLINE_SUBJECTS' | 'CRITICAL_RISK';
  rulesSummary: {
    internalWeight: number;
    examWeight: number;
    overallPassingThreshold: number;
    mandatoryExamMinimum: number;
  };
}

export class PassingMarksService {
  public static async calculateStudentPassingMarks(studentId: string): Promise<StudentPassingSummary> {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          where: { status: 'ACTIVE' },
          include: { subject: true },
        },
        internalAssessments: {
          include: { subject: true },
        },
      },
    });

    if (!student) {
      throw new Error(`Student with ID ${studentId} not found`);
    }

    // Load institutional rules from SystemSetting if present, else standard defaults
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: ['INTERNAL_WEIGHT', 'EXAM_WEIGHT', 'PASSING_THRESHOLD', 'EXAM_MINIMUM_THRESHOLD'],
        },
      },
    });

    const settingsMap: Record<string, number> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = parseFloat(s.value);
    });

    const internalWeight = settingsMap['INTERNAL_WEIGHT'] || 40; // 40%
    const examWeight = settingsMap['EXAM_WEIGHT'] || 60; // 60%
    const overallPassingThreshold = settingsMap['PASSING_THRESHOLD'] || 50; // 50% total
    const mandatoryExamMinimum = settingsMap['EXAM_MINIMUM_THRESHOLD'] || 45; // 45% in semester exam

    const activeEnrollments = student.enrollments.filter((e) => e.semester === student.currentSemester);
    const courses: CoursePassingRequirement[] = [];

    for (const enrollment of activeEnrollments) {
      const subject = enrollment.subject;
      const assessments = student.internalAssessments.filter((a) => a.subjectId === subject.id);

      let internalMaxTotal = 0;
      let internalObtainedTotal = 0;

      const assessmentDetails = assessments.map((a) => {
        internalMaxTotal += a.maxScore;
        internalObtainedTotal += a.score;
        const pct = a.maxScore > 0 ? Number(((a.score / a.maxScore) * 100).toFixed(1)) : 0;
        return {
          type: a.assessmentType,
          score: a.score,
          maxScore: a.maxScore,
          percentage: pct,
        };
      });

      const internalPercentage =
        internalMaxTotal > 0 ? Number(((internalObtainedTotal / internalMaxTotal) * 100).toFixed(1)) : 50; // fallback neutral

      // Weighted internal contribution (e.g. 70% of 40 = 28 marks)
      const internalContribution = Number(((internalPercentage / 100) * internalWeight).toFixed(1));

      // Marks needed from the exam component to hit overallPassingThreshold (e.g. 50 - 28 = 22 marks out of 60)
      const rawNeededExamContribution = Math.max(0, overallPassingThreshold - internalContribution);

      // Convert needed weighted exam contribution to marks out of 100
      const rawExamPercentNeeded = (rawNeededExamContribution / examWeight) * 100;

      // Apply mandatory semester exam minimum threshold (e.g. cannot pass with <45% in final exam even if internal is 100%)
      const requiredExamMarksOutof100 = Math.ceil(Math.max(mandatoryExamMinimum, rawExamPercentNeeded));

      const achievable = requiredExamMarksOutof100 <= 100;
      const margin = Math.max(0, 100 - requiredExamMarksOutof100);

      let status: 'SAFE' | 'BORDERLINE' | 'CRITICAL' = 'SAFE';
      let recommendation = `Maintain study rhythm. Scoring ${requiredExamMarksOutof100}% in the semester exam satisfies course passing requirements.`;

      if (!achievable) {
        status = 'CRITICAL';
        recommendation = `Internal marks are critically low. Scoring 100% in the final exam would yield ${(internalContribution + examWeight).toFixed(1)}/100, below the 50% passing threshold. Consult advisor for supplementary roadmap.`;
      } else if (requiredExamMarksOutof100 >= 75) {
        status = 'CRITICAL';
        recommendation = `High difficulty target: A minimum score of ${requiredExamMarksOutof100}% is required in the final examination to pass. Attend remedial sessions immediately.`;
      } else if (requiredExamMarksOutof100 >= 55) {
        status = 'BORDERLINE';
        recommendation = `Moderate margin: Scoring at least ${requiredExamMarksOutof100}% in the final examination is required. Prioritize key high-weight units.`;
      }

      courses.push({
        subjectId: subject.id,
        code: subject.code,
        name: subject.name,
        credits: subject.credits,
        internalWeight,
        examWeight,
        overallPassingThreshold,
        mandatoryExamMinimum,
        internalAssessments: assessmentDetails,
        internalMaxTotal,
        internalObtainedTotal,
        internalPercentage,
        internalContribution,
        requiredExamMarksOutof100: Math.min(100, requiredExamMarksOutof100),
        requiredExamContribution: Number(((Math.min(100, requiredExamMarksOutof100) / 100) * examWeight).toFixed(1)),
        achievable,
        margin,
        status,
        recommendation,
        assumptions: [
          `Continuous Internal Assessments account for ${internalWeight}% of the composite course mark.`,
          `End-Semester Examination accounts for ${examWeight}% of the composite course mark.`,
          `Institutional passing mark requires an overall composite score of \u2265 ${overallPassingThreshold}%.`,
          `Mandatory Semester Examination cutoff requires scoring at least ${mandatoryExamMinimum}% in the external paper regardless of internal score.`,
        ],
      });
    }

    let overallStatus: 'ALL_ON_TRACK' | 'BORDERLINE_SUBJECTS' | 'CRITICAL_RISK' = 'ALL_ON_TRACK';
    if (courses.some((c) => c.status === 'CRITICAL')) {
      overallStatus = 'CRITICAL_RISK';
    } else if (courses.some((c) => c.status === 'BORDERLINE')) {
      overallStatus = 'BORDERLINE_SUBJECTS';
    }

    return {
      studentId,
      semester: student.currentSemester,
      courses,
      overallStatus,
      rulesSummary: {
        internalWeight,
        examWeight,
        overallPassingThreshold,
        mandatoryExamMinimum,
      },
    };
  }
}
