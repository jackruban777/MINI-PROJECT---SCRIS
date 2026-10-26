import { prisma } from '../lib/prisma';
import { config } from '../config';

export interface FactorBreakdown {
  name: string;
  weight: number;
  score: number; // 0 to 100
  weightedScore: number;
  explanation: string;
}

export interface SubjectFocusItem {
  subjectId: string;
  code: string;
  name: string;
  credits: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  internalAverage: number | null;
  attendancePercentage: number | null;
  hasArrear: boolean;
  contributingFactors: string[];
  recommendedAction: string;
  targetMetric?: string;
}

export interface RiskAssessmentResult {
  studentId: string;
  score: number;
  category: 'SAFE' | 'WATCH' | 'CRITICAL';
  isIncomplete: boolean;
  missingFields: string[];
  explanation: string;
  factors: FactorBreakdown[];
  recommendations: string[];
  subjectFocus: SubjectFocusItem[];
  cgpa: number;
  sgpa: number | null;
  totalCreditsEarned: number;
  pendingArrearsCount: number;
  calculatedAt: Date;
}

// Grade point map for institutional standard 10-point grading
export const GRADE_POINT_MAP: Record<string, number> = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'RA': 0, // Re-appear / Fail
  'U': 0,
  'AB': 0, // Absent
};

export class AcademicRiskEngine {
  /**
   * Calculate SGPA for a given list of semester results
   */
  public static calculateSGPA(results: { grade: string; credits: number }[]): { sgpa: number; totalCredits: number } {
    if (!results || results.length === 0) {
      return { sgpa: 0, totalCredits: 0 };
    }

    let totalPoints = 0;
    let totalCredits = 0;

    for (const r of results) {
      const grade = r.grade.toUpperCase().trim();
      const point = GRADE_POINT_MAP[grade] ?? 0;
      totalPoints += point * r.credits;
      totalCredits += r.credits;
    }

    if (totalCredits === 0) return { sgpa: 0, totalCredits: 0 };
    const sgpa = Number((totalPoints / totalCredits).toFixed(2));
    return { sgpa, totalCredits };
  }

  /**
   * Calculate CGPA across all semester results
   */
  public static calculateCGPA(results: { grade: string; credits: number; status: string }[]): {
    cgpa: number;
    totalEarnedCredits: number;
    totalAttemptedCredits: number;
  } {
    if (!results || results.length === 0) {
      return { cgpa: 0, totalEarnedCredits: 0, totalAttemptedCredits: 0 };
    }

    let totalPoints = 0;
    let totalAttemptedCredits = 0;
    let totalEarnedCredits = 0;

    for (const r of results) {
      const grade = r.grade.toUpperCase().trim();
      const point = GRADE_POINT_MAP[grade] ?? 0;
      totalPoints += point * r.credits;
      totalAttemptedCredits += r.credits;
      if (r.status === 'PASS' && point > 0) {
        totalEarnedCredits += r.credits;
      }
    }

    if (totalAttemptedCredits === 0) {
      return { cgpa: 0, totalEarnedCredits: 0, totalAttemptedCredits: 0 };
    }

    const cgpa = Number((totalPoints / totalAttemptedCredits).toFixed(2));
    return { cgpa, totalEarnedCredits, totalAttemptedCredits };
  }

  /**
   * Evaluates comprehensive academic risk for a student
   */
  public static async assessStudentRisk(studentId: string): Promise<RiskAssessmentResult> {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        enrollments: {
          include: { subject: true },
        },
        internalAssessments: {
          include: { subject: true },
        },
        semesterResults: {
          include: { subject: true },
        },
        attendanceRecords: {
          include: { subject: true },
        },
        arrears: {
          include: { subject: true },
        },
      },
    });

    if (!student) {
      throw new Error(`Student with ID ${studentId} not found`);
    }

    const currentSemester = student.currentSemester;
    const missingFields: string[] = [];

    // 1. Pending Arrears Analysis (Weight: 30%)
    const pendingArrears = student.arrears.filter((a) => a.status === 'PENDING');
    const pendingArrearsCount = pendingArrears.length;
    // Arrears risk: 0 -> 0; 1 -> 40; 2 -> 70; 3+ -> 100
    let arrearsScore = 0;
    let arrearsExplanation = 'No pending arrears. Course completion on schedule.';
    if (pendingArrearsCount === 1) {
      arrearsScore = 40;
      arrearsExplanation = `1 pending arrear in ${pendingArrears[0]?.subject.name || 'a previous course'}. Needs attention to prevent delay.`;
    } else if (pendingArrearsCount === 2) {
      arrearsScore = 70;
      arrearsExplanation = `2 pending arrears: ${pendingArrears.map((a) => a.subject.code).join(', ')}. Risk of delayed course completion.`;
    } else if (pendingArrearsCount >= 3) {
      arrearsScore = 100;
      arrearsExplanation = `Critical arrear burden with ${pendingArrearsCount} pending arrears (${pendingArrears.map((a) => a.subject.code).join(', ')}). Immediate intervention required.`;
    }

    // 2. Internal Assessment Analysis (Weight: 35%)
    // Filter assessments for the current semester enrolled subjects
    const currentEnrollments = student.enrollments.filter((e) => e.semester === currentSemester && e.status === 'ACTIVE');
    const currentSubjectIds = currentEnrollments.map((e) => e.subjectId);

    const currentAssessments = student.internalAssessments.filter((a) =>
      currentSubjectIds.length > 0 ? currentSubjectIds.includes(a.subjectId) : true
    );

    let internalScore = 0;
    let internalExplanation = 'No current internal assessment records found yet.';
    if (currentAssessments.length === 0) {
      missingFields.push('Internal Assessments for Current Semester');
      internalScore = 15; // baseline neutral, not zero
      internalExplanation = 'Assessment cycle not yet commenced or marks pending publication.';
    } else {
      // Calculate average percentage across assessments
      const percentages = currentAssessments.map((a) => (a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0));
      const avgPercentage = percentages.reduce((acc, p) => acc + p, 0) / percentages.length;

      // Invert percentage to risk score: 100% score -> 0 risk; 50% pass threshold -> ~50 risk; <40% -> 80-100 risk
      if (avgPercentage >= 75) {
        internalScore = Math.max(0, Math.round((90 - avgPercentage) * 0.8));
        internalExplanation = `Strong internal assessment average of ${avgPercentage.toFixed(1)}%. Consistent academic retention.`;
      } else if (avgPercentage >= 50) {
        internalScore = Math.round(35 + (75 - avgPercentage) * 1.2);
        internalExplanation = `Moderate internal assessment average of ${avgPercentage.toFixed(1)}%. Below institutional target of 75%.`;
      } else {
        internalScore = Math.min(100, Math.round(65 + (50 - avgPercentage) * 1.5));
        internalExplanation = `Low internal assessment average of ${avgPercentage.toFixed(1)}% (below pass mark of 50%). High risk of semester exam failure.`;
      }
    }

    // 3. Attendance Analysis (Weight: 15%)
    const currentAttendance = student.attendanceRecords.filter((a) => a.semester === currentSemester);
    let attendanceScore = 0;
    let attendanceExplanation = 'No attendance records published for the current semester.';
    if (currentAttendance.length === 0) {
      missingFields.push('Attendance Records for Current Semester');
      attendanceScore = 10;
      attendanceExplanation = 'Attendance data not yet available for current semester.';
    } else {
      const avgAttendance =
        currentAttendance.reduce((acc, a) => acc + a.percentage, 0) / currentAttendance.length;

      const belowThresholdCount = currentAttendance.filter((a) => a.percentage < config.attendanceThreshold).length;

      if (avgAttendance >= 85) {
        attendanceScore = 0;
        attendanceExplanation = `Excellent average attendance of ${avgAttendance.toFixed(1)}%. Well above requirement.`;
      } else if (avgAttendance >= config.attendanceThreshold) {
        attendanceScore = Math.round((85 - avgAttendance) * 3);
        attendanceExplanation = `Satisfactory attendance of ${avgAttendance.toFixed(1)}% (Institutional minimum: ${config.attendanceThreshold}%).`;
      } else {
        attendanceScore = Math.min(100, Math.round(50 + (config.attendanceThreshold - avgAttendance) * 2.5));
        attendanceExplanation = `Attendance concern: Average is ${avgAttendance.toFixed(1)}% (<${config.attendanceThreshold}%). ${belowThresholdCount} subject(s) below hall ticket eligibility.`;
      }
    }

    // 4. CGPA & Performance Trend Analysis (Weight: 15%)
    const { cgpa, totalEarnedCredits } = this.calculateCGPA(student.semesterResults);
    let cgpaScore = 0;
    let cgpaExplanation = 'First semester student; CGPA will be calculated following semester examinations.';
    if (student.semesterResults.length === 0) {
      missingFields.push('Previous Semester Examination Results');
      cgpaScore = 15;
    } else {
      // 10-point scale: 8.5+ -> 0 risk; 7.0-8.5 -> 20 risk; 6.0-7.0 -> 45 risk; <6.0 -> 75-100 risk
      if (cgpa >= 8.5) {
        cgpaScore = 5;
        cgpaExplanation = `Cumulative GPA of ${cgpa.toFixed(2)} reflects high academic proficiency.`;
      } else if (cgpa >= 7.0) {
        cgpaScore = 25;
        cgpaExplanation = `Good cumulative GPA of ${cgpa.toFixed(2)}. Steady academic progress.`;
      } else if (cgpa >= 6.0) {
        cgpaScore = 55;
        cgpaExplanation = `CGPA of ${cgpa.toFixed(2)} is near minimum degree classification threshold.`;
      } else {
        cgpaScore = Math.min(100, Math.round(70 + (6.0 - cgpa) * 20));
        cgpaExplanation = `Low cumulative GPA of ${cgpa.toFixed(2)} indicates sustained learning difficulties.`;
      }
    }

    // Previous semester SGPA
    const previousSemesterResults = student.semesterResults.filter((r) => r.semester === currentSemester - 1);
    const { sgpa } = this.calculateSGPA(previousSemesterResults);

    // 5. Missed or Low Assessments (Weight: 5%)
    const lowAssessments = currentAssessments.filter((a) => a.maxScore > 0 && a.score / a.maxScore < 0.4);
    let missedScore = 0;
    let missedExplanation = 'All scheduled assessments attended with passing marks.';
    if (lowAssessments.length > 0) {
      missedScore = Math.min(100, lowAssessments.length * 35);
      missedExplanation = `${lowAssessments.length} assessment score(s) fell below the critical 40% threshold.`;
    }

    // Factors compilation
    const factors: FactorBreakdown[] = [
      {
        name: 'Internal Assessment Performance',
        weight: config.riskWeights.internalMarks,
        score: internalScore,
        weightedScore: Number((internalScore * config.riskWeights.internalMarks).toFixed(1)),
        explanation: internalExplanation,
      },
      {
        name: 'Pending Arrears Status',
        weight: config.riskWeights.pendingArrears,
        score: arrearsScore,
        weightedScore: Number((arrearsScore * config.riskWeights.pendingArrears).toFixed(1)),
        explanation: arrearsExplanation,
      },
      {
        name: 'CGPA & Cumulative History',
        weight: config.riskWeights.cgpaTrend,
        score: cgpaScore,
        weightedScore: Number((cgpaScore * config.riskWeights.cgpaTrend).toFixed(1)),
        explanation: cgpaExplanation,
      },
      {
        name: 'Class Attendance Record',
        weight: config.riskWeights.attendance,
        score: attendanceScore,
        weightedScore: Number((attendanceScore * config.riskWeights.attendance).toFixed(1)),
        explanation: attendanceExplanation,
      },
      {
        name: 'Sub-Threshold Assessments',
        weight: config.riskWeights.missedAssessments,
        score: missedScore,
        weightedScore: Number((missedScore * config.riskWeights.missedAssessments).toFixed(1)),
        explanation: missedExplanation,
      },
    ];

    // Compute composite risk score (0 - 100)
    const compositeScore = Math.round(factors.reduce((sum, f) => sum + f.weightedScore, 0));
    const finalScore = Math.max(0, Math.min(100, compositeScore));

    // Determine category
    let category: 'SAFE' | 'WATCH' | 'CRITICAL';
    if (finalScore <= config.riskThresholds.safeMax) {
      category = 'SAFE';
    } else if (finalScore <= config.riskThresholds.watchMax) {
      category = 'WATCH';
    } else {
      category = 'CRITICAL';
    }

    // High level human-readable explanation
    let overallExplanation = '';
    if (category === 'SAFE') {
      overallExplanation = `Academic risk is currently low (Score: ${finalScore}/100 — Safe). Academic indicators demonstrate healthy course completion trajectory.`;
    } else if (category === 'WATCH') {
      const mainFactors = factors.filter((f) => f.score >= 40).map((f) => f.name.toLowerCase());
      overallExplanation = `Academic risk requires monitoring (Score: ${finalScore}/100 — Watch). Primary contributing concerns: ${mainFactors.join(', ') || 'moderate academic scores'}.`;
    } else {
      const criticalFactors = factors.filter((f) => f.score >= 60).map((f) => f.name);
      overallExplanation = `High academic risk identified (Score: ${finalScore}/100 — Critical). Urgent intervention advised due to: ${criticalFactors.join(', ')}.`;
    }

    // Actionable Recommendations
    const recommendations: string[] = [];
    if (pendingArrearsCount > 0) {
      recommendations.push(
        `Register for supplementary examinations to clear ${pendingArrearsCount} pending arrear(s) before semester completion.`
      );
    }
    if (attendanceScore >= 40) {
      recommendations.push(
        `Prioritize attendance in classes with <${config.attendanceThreshold}% to avoid condonation or semester exam debarment.`
      );
    }
    if (internalScore >= 40) {
      recommendations.push(
        'Participate in faculty office hours and scheduled remedial problem-solving sessions before Model Examinations.'
      );
    }
    if (category === 'CRITICAL') {
      recommendations.push(
        'Schedule a mandatory one-on-one academic counselling session with your assigned Faculty Advisor.'
      );
    }
    if (recommendations.length === 0) {
      recommendations.push('Maintain current study discipline and attendance cadence through final semester examinations.');
    }

    // 6. Subject Focus Analysis
    const subjectFocus: SubjectFocusItem[] = [];

    // Analyze each subject enrolled in current semester
    for (const enrollment of currentEnrollments) {
      const subject = enrollment.subject;
      const subAssessments = student.internalAssessments.filter((a) => a.subjectId === subject.id);
      const subAttendance = student.attendanceRecords.find((a) => a.subjectId === subject.id && a.semester === currentSemester);
      const subArrear = student.arrears.find((a) => a.subjectId === subject.id && a.status === 'PENDING');

      const avgMark =
        subAssessments.length > 0
          ? subAssessments.reduce((acc, a) => acc + (a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0), 0) /
            subAssessments.length
          : null;

      const attPct = subAttendance ? subAttendance.percentage : null;
      const subFactors: string[] = [];
      let subRiskLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      let recommendedAction = 'Maintain satisfactory attendance and prepare for upcoming assessments.';
      let targetMetric: string | undefined;

      if (subArrear) {
        subFactors.push('Pending arrear record');
        subRiskLevel = 'HIGH';
        recommendedAction = 'Register for remedial tutorials and clear arrears in the upcoming examination cycle.';
      }

      if (avgMark !== null && avgMark < 50) {
        subFactors.push(`Internal score (${avgMark.toFixed(0)}%) is below passing threshold (50%)`);
        subRiskLevel = 'HIGH';
        const needed = Math.min(100, Math.round(50 * 2 - avgMark));
        recommendedAction = `Score at least ${needed}% in the next assessment to lift the subject average to passing criteria.`;
        targetMetric = `Target Score: ${needed}%`;
      } else if (avgMark !== null && avgMark < 65) {
        subFactors.push(`Borderline internal performance (${avgMark.toFixed(0)}%)`);
        if (subRiskLevel !== 'HIGH') subRiskLevel = 'MEDIUM';
        recommendedAction = 'Review key unit concepts with tutor to ensure safe margin for semester grading.';
      }

      if (attPct !== null && attPct < config.attendanceThreshold) {
        subFactors.push(`Attendance (${attPct.toFixed(1)}%) is below mandatory ${config.attendanceThreshold}%`);
        if (subRiskLevel !== 'HIGH') subRiskLevel = 'MEDIUM';
        if (subAttendance && subAttendance.totalClasses > 0) {
          const classesNeeded = Math.ceil((config.attendanceThreshold * subAttendance.totalClasses - 100 * subAttendance.attendedClasses) / (100 - config.attendanceThreshold));
          recommendedAction = `Attend next ${Math.max(1, classesNeeded)} consecutive lecture(s) without absence to restore required ${config.attendanceThreshold}%.`;
          targetMetric = `Attend ${Math.max(1, classesNeeded)} consecutive classes`;
        }
      }

      subjectFocus.push({
        subjectId: subject.id,
        code: subject.code,
        name: subject.name,
        credits: subject.credits,
        riskLevel: subRiskLevel,
        internalAverage: avgMark !== null ? Number(avgMark.toFixed(1)) : null,
        attendancePercentage: attPct !== null ? Number(attPct.toFixed(1)) : null,
        hasArrear: !!subArrear,
        contributingFactors: subFactors,
        recommendedAction,
        targetMetric,
      });
    }

    // Sort subject focus: HIGH risk first, then MEDIUM, then LOW
    const riskOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    subjectFocus.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);

    const result: RiskAssessmentResult = {
      studentId: student.id,
      score: finalScore,
      category,
      isIncomplete: missingFields.length > 0,
      missingFields,
      explanation: overallExplanation,
      factors,
      recommendations,
      subjectFocus,
      cgpa,
      sgpa,
      totalCreditsEarned: totalEarnedCredits,
      pendingArrearsCount,
      calculatedAt: new Date(),
    };

    return result;
  }

  /**
   * Recalculates and persists risk snapshot for a student in database
   */
  public static async saveRiskSnapshot(studentId: string): Promise<RiskAssessmentResult> {
    const assessment = await this.assessStudentRisk(studentId);
    const student = await prisma.student.findUnique({ where: { id: studentId } });

    if (student) {
      await prisma.riskSnapshot.create({
        data: {
          studentId: student.id,
          semester: student.currentSemester,
          score: assessment.score,
          category: assessment.category,
          explanation: assessment.explanation,
          contributingFactors: JSON.stringify(assessment.factors),
          calculatedAt: assessment.calculatedAt,
        },
      });
    }

    return assessment;
  }

  /**
   * CGPA What-If Simulator
   * Pure calculation based on official credit rules and hypothetical grade choices.
   * Never mutates or updates official academic records.
   */
  public static async simulateCGPA(
    studentId: string,
    hypotheticalCourses: {
      code: string;
      name: string;
      credits: number;
      grade: string;
    }[]
  ): Promise<{
    actualCGPA: number;
    actualTotalCredits: number;
    actualEarnedCredits: number;
    simulatedCGPA: number;
    simulatedTotalCredits: number;
    simulatedEarnedCredits: number;
    cgpaDelta: number;
    simulatedSemesterSGPA: number;
    breakdown: {
      code: string;
      name: string;
      credits: number;
      grade: string;
      gradePoint: number;
      points: number;
    }[];
    isHypothetical: true;
    disclaimer: string;
  }> {
    const results = await prisma.semesterResult.findMany({
      where: { studentId },
    });

    const { cgpa: actualCGPA, totalEarnedCredits: actualEarnedCredits, totalAttemptedCredits: actualTotalCredits } =
      this.calculateCGPA(results);

    // Calculate existing total grade points
    let currentTotalGradePoints = 0;
    for (const r of results) {
      const pt = GRADE_POINT_MAP[r.grade.toUpperCase().trim()] ?? 0;
      currentTotalGradePoints += pt * r.credits;
    }

    // Process hypothetical courses
    let hypCredits = 0;
    let hypPoints = 0;
    let hypEarnedCredits = 0;

    const breakdown = hypotheticalCourses.map((c) => {
      const grade = c.grade.toUpperCase().trim();
      const gradePoint = GRADE_POINT_MAP[grade] ?? 0;
      const points = gradePoint * c.credits;
      hypCredits += c.credits;
      hypPoints += points;
      if (gradePoint > 0 && grade !== 'RA' && grade !== 'U') {
        hypEarnedCredits += c.credits;
      }
      return {
        code: c.code,
        name: c.name,
        credits: c.credits,
        grade,
        gradePoint,
        points,
      };
    });

    const simulatedSemesterSGPA = hypCredits > 0 ? Number((hypPoints / hypCredits).toFixed(2)) : 0;

    const simulatedTotalCredits = actualTotalCredits + hypCredits;
    const simulatedEarnedCredits = actualEarnedCredits + hypEarnedCredits;
    const simulatedTotalPoints = currentTotalGradePoints + hypPoints;

    const simulatedCGPA =
      simulatedTotalCredits > 0 ? Number((simulatedTotalPoints / simulatedTotalCredits).toFixed(2)) : 0;
    const cgpaDelta = Number((simulatedCGPA - actualCGPA).toFixed(2));

    return {
      actualCGPA,
      actualTotalCredits,
      actualEarnedCredits,
      simulatedCGPA,
      simulatedTotalCredits,
      simulatedEarnedCredits,
      cgpaDelta,
      simulatedSemesterSGPA,
      breakdown,
      isHypothetical: true,
      disclaimer:
        'All calculations displayed are purely hypothetical simulations for academic trajectory planning. Official academic transcripts remain strictly unmodified.',
    };
  }

  /**
   * Retrieves comprehensive semester-wise academic history and trend points
   */
  public static async getHistoricalAcademicHistory(studentId: string): Promise<any> {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        semesterResults: {
          include: { subject: true },
          orderBy: [{ semester: 'asc' }, { subject: { code: 'asc' } }],
        },
        attendanceRecords: {
          include: { subject: true },
          orderBy: [{ semester: 'asc' }, { subject: { code: 'asc' } }],
        },
        arrears: {
          include: { subject: true },
          orderBy: { originalSemester: 'asc' },
        },
        riskSnapshots: {
          orderBy: { calculatedAt: 'asc' },
        },
        interventions: {
          include: { staff: { include: { user: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student) {
      throw new Error(`Student with ID ${studentId} not found`);
    }

    // Group results by semester
    const semestersMap: Record<number, any> = {};
    for (let sem = 1; sem <= student.currentSemester; sem++) {
      semestersMap[sem] = {
        semester: sem,
        courses: [],
        sgpa: null,
        totalCredits: 0,
        earnedCredits: 0,
        averageAttendance: null,
        pendingArrearsCount: 0,
        clearedArrearsCount: 0,
        riskScore: null,
      };
    }

    // Populate semester examination results
    student.semesterResults.forEach((r) => {
      if (!semestersMap[r.semester]) {
        semestersMap[r.semester] = {
          semester: r.semester,
          courses: [],
          sgpa: null,
          totalCredits: 0,
          earnedCredits: 0,
          averageAttendance: null,
          pendingArrearsCount: 0,
          clearedArrearsCount: 0,
          riskScore: null,
        };
      }
      semestersMap[r.semester].courses.push(r);
    });

    // Compute SGPA per semester
    Object.values(semestersMap).forEach((s: any) => {
      if (s.courses.length > 0) {
        const { sgpa, totalCredits } = this.calculateSGPA(s.courses);
        s.sgpa = sgpa;
        s.totalCredits = totalCredits;
        s.earnedCredits = s.courses
          .filter((c: any) => c.status === 'PASS')
          .reduce((acc: number, curr: any) => acc + curr.credits, 0);
      }
    });

    // Attendance per semester
    student.attendanceRecords.forEach((att) => {
      if (semestersMap[att.semester]) {
        if (!semestersMap[att.semester]._attList) semestersMap[att.semester]._attList = [];
        semestersMap[att.semester]._attList.push(att.percentage);
      }
    });

    Object.values(semestersMap).forEach((s: any) => {
      if (s._attList && s._attList.length > 0) {
        s.averageAttendance = Number((s._attList.reduce((a: number, b: number) => a + b, 0) / s._attList.length).toFixed(1));
        delete s._attList;
      }
    });

    // Arrears grouping
    student.arrears.forEach((arr) => {
      if (semestersMap[arr.originalSemester]) {
        if (arr.status === 'PENDING') semestersMap[arr.originalSemester].pendingArrearsCount++;
        else semestersMap[arr.originalSemester].clearedArrearsCount++;
      }
    });

    // Risk snapshots
    student.riskSnapshots.forEach((snap) => {
      if (semestersMap[snap.semester]) {
        semestersMap[snap.semester].riskScore = snap.score;
      }
    });

    // Generate trend chart array
    let runningEarned = 0;
    let runningPoints = 0;
    let runningTotalCredits = 0;

    const trendPoints: {
      semester: string;
      sgpa: number | null;
      cgpa: number | null;
      attendance: number | null;
      riskScore: number | null;
    }[] = [];

    const sortedSemesters = Object.values(semestersMap).sort((a: any, b: any) => a.semester - b.semester);

    sortedSemesters.forEach((s: any) => {
      if (s.courses.length > 0) {
        s.courses.forEach((c: any) => {
          const pt = GRADE_POINT_MAP[c.grade.toUpperCase().trim()] ?? 0;
          runningPoints += pt * c.credits;
          runningTotalCredits += c.credits;
          if (c.status === 'PASS' && pt > 0) {
            runningEarned += c.credits;
          }
        });
        const currentCgpa = runningTotalCredits > 0 ? Number((runningPoints / runningTotalCredits).toFixed(2)) : null;
        trendPoints.push({
          semester: `Sem ${s.semester}`,
          sgpa: s.sgpa,
          cgpa: currentCgpa,
          attendance: s.averageAttendance,
          riskScore: s.riskScore,
        });
      }
    });

    const { cgpa: cumulativeCGPA } = this.calculateCGPA(student.semesterResults);

    return {
      student: {
        id: student.id,
        registerNumber: student.registerNumber,
        name: student.user.name,
        department: student.user.department,
        currentSemester: student.currentSemester,
        cgpa: cumulativeCGPA,
      },
      semesters: sortedSemesters,
      trendPoints,
      interventions: student.interventions,
    };
  }
}
