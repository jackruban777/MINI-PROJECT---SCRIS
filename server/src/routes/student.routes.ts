import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/role';
import { AcademicRiskEngine } from '../services/riskEngine';
import { PassingMarksService } from '../services/passingMarksService';
import { CompletionService } from '../services/completionService';
import { StudentSampleDataService, SampleProfileType } from '../services/studentSampleDataService';
import { config } from '../config';

const router = Router();

// Protect all student routes
router.use(authenticate);
router.use(requireRole(['STUDENT']));

// Helper to ensure authenticated user owns student record
const getStudentId = (req: Request): string => {
  if (!req.user?.studentId) {
    throw new Error('Student profile not associated with this account');
  }
  return req.user.studentId;
};

// 1. Student Dashboard Summary
router.get('/dashboard', async (req: Request, res: Response): Promise<void> => {
  const studentId = getStudentId(req);

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { name: true, email: true, department: true } },
      advisor: { include: { user: { select: { name: true, email: true } } } },
    },
  });

  if (!student) {
    res.status(404).json({ success: false, error: { message: 'Student profile not found' } });
    return;
  }

  // Calculate live academic risk
  const riskAssessment = await AcademicRiskEngine.assessStudentRisk(studentId);

  // Fetch upcoming examinations & class schedule
  const upcomingExams = await prisma.timetableEntry.findMany({
    where: {
      timetable: {
        department: student.user.department,
        semester: student.currentSemester,
        section: student.section,
      },
      examDate: { gte: new Date() },
    },
    include: { subject: true },
    orderBy: { examDate: 'asc' },
    take: 5,
  });

  // Recent notifications
  const recentNotifications = await prisma.notification.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // Attendance summary
  const attendanceList = await prisma.attendanceRecord.findMany({
    where: { studentId, semester: student.currentSemester },
    include: { subject: true },
  });

  const overallAttendance =
    attendanceList.length > 0
      ? Number((attendanceList.reduce((acc, a) => acc + a.percentage, 0) / attendanceList.length).toFixed(1))
      : null;

  res.status(200).json({
    success: true,
    data: {
      student: {
        id: student.id,
        name: student.user.name,
        email: student.user.email,
        registerNumber: student.registerNumber,
        department: student.user.department,
        degree: student.degree,
        currentSemester: student.currentSemester,
        section: student.section,
        batchYear: student.batchYear,
        advisor: student.advisor ? { name: student.advisor.user.name, email: student.advisor.user.email } : null,
      },
      summary: {
        cgpa: riskAssessment.cgpa,
        sgpa: riskAssessment.sgpa,
        totalCreditsEarned: riskAssessment.totalCreditsEarned,
        pendingArrearsCount: riskAssessment.pendingArrearsCount,
        overallAttendance,
        attendanceThreshold: config.attendanceThreshold,
      },
      risk: {
        score: riskAssessment.score,
        category: riskAssessment.category,
        explanation: riskAssessment.explanation,
        factors: riskAssessment.factors,
        recommendations: riskAssessment.recommendations,
        calculatedAt: riskAssessment.calculatedAt,
      },
      subjectFocus: riskAssessment.subjectFocus.slice(0, 4),
      upcomingExams,
      recentNotifications,
    },
  });
});

// 2. My Academic Performance (Internal Assessments)
router.get('/performance', async (req: Request, res: Response): Promise<void> => {
  const studentId = getStudentId(req);

  const assessments = await prisma.internalAssessment.findMany({
    where: { studentId },
    include: { subject: true },
    orderBy: [{ assessmentDate: 'desc' }, { subject: { code: 'asc' } }],
  });

  // Group assessments by subject
  const groupedBySubject: Record<string, any> = {};
  assessments.forEach((a) => {
    if (!groupedBySubject[a.subjectId]) {
      groupedBySubject[a.subjectId] = {
        subject: a.subject,
        assessments: [],
        averagePercentage: 0,
      };
    }
    groupedBySubject[a.subjectId].assessments.push({
      id: a.id,
      assessmentType: a.assessmentType,
      score: a.score,
      maxScore: a.maxScore,
      percentage: a.maxScore > 0 ? Number(((a.score / a.maxScore) * 100).toFixed(1)) : 0,
      assessmentDate: a.assessmentDate,
    });
  });

  // Calculate subject-wise internal averages
  Object.values(groupedBySubject).forEach((group: any) => {
    const totalPct = group.assessments.reduce((sum: number, item: any) => sum + item.percentage, 0);
    group.averagePercentage = Number((totalPct / group.assessments.length).toFixed(1));
  });

  res.status(200).json({
    success: true,
    data: {
      assessmentsBySubject: Object.values(groupedBySubject),
      totalAssessments: assessments.length,
    },
  });
});

// 3. Semester Results
router.get('/results', async (req: Request, res: Response): Promise<void> => {
  const studentId = getStudentId(req);

  const results = await prisma.semesterResult.findMany({
    where: { studentId },
    include: { subject: true },
    orderBy: [{ semester: 'asc' }, { subject: { code: 'asc' } }],
  });

  // Group results by semester
  const semesterMap: Record<number, any> = {};
  results.forEach((r) => {
    if (!semesterMap[r.semester]) {
      semesterMap[r.semester] = {
        semester: r.semester,
        courses: [],
        sgpa: 0,
        totalCredits: 0,
        earnedCredits: 0,
      };
    }
    semesterMap[r.semester].courses.push(r);
  });

  // Compute SGPA for each semester
  Object.values(semesterMap).forEach((sem: any) => {
    const { sgpa, totalCredits } = AcademicRiskEngine.calculateSGPA(sem.courses);
    sem.sgpa = sgpa;
    sem.totalCredits = totalCredits;
    sem.earnedCredits = sem.courses
      .filter((c: any) => c.status === 'PASS')
      .reduce((acc: number, c: any) => acc + c.credits, 0);
  });

  const { cgpa, totalEarnedCredits, totalAttemptedCredits } = AcademicRiskEngine.calculateCGPA(results);

  res.status(200).json({
    success: true,
    data: {
      semesters: Object.values(semesterMap),
      overall: {
        cgpa,
        totalEarnedCredits,
        totalAttemptedCredits,
      },
    },
  });
});

// 4. Attendance
router.get('/attendance', async (req: Request, res: Response): Promise<void> => {
  const studentId = getStudentId(req);
  const student = await prisma.student.findUnique({ where: { id: studentId } });

  const attendance = await prisma.attendanceRecord.findMany({
    where: { studentId, semester: student?.currentSemester },
    include: { subject: true },
    orderBy: { subject: { code: 'asc' } },
  });

  const enrichedAttendance = attendance.map((record) => {
    const isBelowThreshold = record.percentage < config.attendanceThreshold;

    // Calculate permissible absences or classes needed to reach threshold
    let permissibleAbsences = 0;
    let classesNeededToCatchUp = 0;

    if (!isBelowThreshold) {
      // How many consecutive classes can be missed before falling below 75%
      // (attended) / (total + x) >= 0.75  =>  x <= (attended / 0.75) - total
      permissibleAbsences = Math.max(0, Math.floor(record.attendedClasses / (config.attendanceThreshold / 100) - record.totalClasses));
    } else {
      // How many consecutive classes must be attended to reach 75%
      // (attended + x) / (total + x) >= 0.75 => x >= (0.75*total - attended) / (1 - 0.75)
      classesNeededToCatchUp = Math.ceil(
        (0.75 * record.totalClasses - record.attendedClasses) / 0.25
      );
    }

    return {
      id: record.id,
      subjectId: record.subjectId,
      code: record.subject.code,
      name: record.subject.name,
      credits: record.subject.credits,
      attendedClasses: record.attendedClasses,
      totalClasses: record.totalClasses,
      percentage: record.percentage,
      isBelowThreshold,
      permissibleAbsences,
      classesNeededToCatchUp,
    };
  });

  const overallAvg =
    enrichedAttendance.length > 0
      ? Number((enrichedAttendance.reduce((acc, a) => acc + a.percentage, 0) / enrichedAttendance.length).toFixed(1))
      : 0;

  res.status(200).json({
    success: true,
    data: {
      records: enrichedAttendance,
      overallPercentage: overallAvg,
      threshold: config.attendanceThreshold,
      atRiskCount: enrichedAttendance.filter((a) => a.isBelowThreshold).length,
    },
  });
});

// 5. Arrears
router.get('/arrears', async (req: Request, res: Response): Promise<void> => {
  const studentId = getStudentId(req);

  const arrears = await prisma.arrear.findMany({
    where: { studentId },
    include: { subject: true },
    orderBy: [{ status: 'desc' }, { originalSemester: 'asc' }],
  });

  const pendingArrears = arrears.filter((a) => a.status === 'PENDING');
  const clearedArrears = arrears.filter((a) => a.status === 'CLEARED');

  res.status(200).json({
    success: true,
    data: {
      pending: pendingArrears,
      cleared: clearedArrears,
      totalPending: pendingArrears.length,
      totalCleared: clearedArrears.length,
    },
  });
});

// 6. Subject Focus
router.get('/subject-focus', async (req: Request, res: Response): Promise<void> => {
  const studentId = getStudentId(req);
  const assessment = await AcademicRiskEngine.assessStudentRisk(studentId);

  res.status(200).json({
    success: true,
    data: {
      subjectFocus: assessment.subjectFocus,
      recommendations: assessment.recommendations,
      riskCategory: assessment.category,
      riskScore: assessment.score,
    },
  });
});

// 7. Timetable & Exam Schedule
router.get('/timetable', async (req: Request, res: Response): Promise<void> => {
  const studentId = getStudentId(req);
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { user: true },
  });

  if (!student) {
    res.status(404).json({ success: false, error: { message: 'Student profile not found' } });
    return;
  }

  const timetable = await prisma.timetable.findFirst({
    where: {
      department: student.user.department,
      semester: student.currentSemester,
      section: student.section,
    },
    include: {
      entries: {
        include: { subject: true },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      },
    },
  });

  res.status(200).json({
    success: true,
    data: {
      timetable: timetable || {
        department: student.user.department,
        semester: student.currentSemester,
        section: student.section,
        entries: [],
      },
    },
  });
});

// 8. Notifications
router.get('/notifications', async (req: Request, res: Response): Promise<void> => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  res.status(200).json({
    success: true,
    data: {
      notifications,
      unreadCount,
    },
  });
});

router.put('/notifications/:id/read', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  await prisma.notification.updateMany({
    where: { id, userId: req.user!.userId },
    data: { isRead: true },
  });

  res.status(200).json({ success: true, data: { message: 'Marked as read' } });
});

router.put('/notifications/read-all', async (req: Request, res: Response): Promise<void> => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.userId, isRead: false },
    data: { isRead: true },
  });

  res.status(200).json({ success: true, data: { message: 'All notifications marked as read' } });
});

// 9. Profile (Read-only academic info, editable non-academic fields)
router.get('/profile', async (req: Request, res: Response): Promise<void> => {
  const studentId = getStudentId(req);

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { id: true, name: true, email: true, department: true, role: true, createdAt: true } },
      advisor: { include: { user: { select: { name: true, email: true } } } },
    },
  });

  res.status(200).json({
    success: true,
    data: { student },
  });
});

router.put('/profile', async (req: Request, res: Response): Promise<void> => {
  const studentId = getStudentId(req);
  const { phone } = req.body;

  // Strict check: ONLY non-academic fields (phone) may be updated by student!
  const updatedStudent = await prisma.student.update({
    where: { id: studentId },
    data: { phone },
    include: {
      user: { select: { name: true, email: true, department: true } },
    },
  });

  res.status(200).json({
    success: true,
    data: { student: updatedStudent, message: 'Profile updated successfully.' },
  });
});

// 10. CGPA Simulator Baseline Data
router.get('/cgpa-simulator', async (req: Request, res: Response): Promise<void> => {
  const studentId = getStudentId(req);

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      enrollments: {
        where: { status: 'ACTIVE' },
        include: { subject: true },
      },
      semesterResults: true,
    },
  });

  if (!student) {
    res.status(404).json({ success: false, error: { message: 'Student not found' } });
    return;
  }

  const { cgpa, totalEarnedCredits, totalAttemptedCredits } =
    AcademicRiskEngine.calculateCGPA(student.semesterResults);

  // Suggested courses from currently enrolled semester subjects
  const enrolledCourses = student.enrollments
    .filter((e) => e.semester === student.currentSemester)
    .map((e) => ({
      code: e.subject.code,
      name: e.subject.name,
      credits: e.subject.credits,
      defaultGrade: 'A',
    }));

  res.status(200).json({
    success: true,
    data: {
      actualCGPA: cgpa,
      actualTotalCredits: totalAttemptedCredits,
      actualEarnedCredits: totalEarnedCredits,
      enrolledCourses,
      gradingScale: [
        { grade: 'O', point: 10, label: 'Outstanding (10)' },
        { grade: 'A+', point: 9, label: 'Excellent (9)' },
        { grade: 'A', point: 8, label: 'Very Good (8)' },
        { grade: 'B+', point: 7, label: 'Good (7)' },
        { grade: 'B', point: 6, label: 'Above Average (6)' },
        { grade: 'C', point: 5, label: 'Average (5)' },
        { grade: 'RA', point: 0, label: 'Re-appear / Arrear (0)' },
      ],
      disclaimer: 'Simulations are strictly hypothetical and do not impact official academic transcripts.',
    },
  });
});

// 11. CGPA Simulation Calculation
router.post('/cgpa-simulator/simulate', async (req: Request, res: Response): Promise<void> => {
  const studentId = getStudentId(req);
  const { courses } = req.body;

  if (!Array.isArray(courses)) {
    res.status(400).json({ success: false, error: { message: 'Courses must be an array.' } });
    return;
  }

  const simulation = await AcademicRiskEngine.simulateCGPA(studentId, courses);

  res.status(200).json({
    success: true,
    data: simulation,
  });
});

// 12. Minimum Passing Marks Calculator
router.get('/passing-marks', async (req: Request, res: Response): Promise<void> => {
  const studentId = getStudentId(req);
  const calculation = await PassingMarksService.calculateStudentPassingMarks(studentId);

  res.status(200).json({
    success: true,
    data: calculation,
  });
});

// 13. Projected Course Completion & Timeline
router.get('/course-completion', async (req: Request, res: Response): Promise<void> => {
  const studentId = getStudentId(req);
  const projection = await CompletionService.calculateCourseCompletion(studentId);

  res.status(200).json({
    success: true,
    data: projection,
  });
});

// 14. Comprehensive Semester-wise Academic History & Trend Points
router.get('/academic-history', async (req: Request, res: Response): Promise<void> => {
  const studentId = getStudentId(req);
  const history = await AcademicRiskEngine.getHistoricalAcademicHistory(studentId);

  res.status(200).json({
    success: true,
    data: history,
  });
});

// 15. Predefined Demo Profiles Catalog
router.get('/sample-profiles', async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {
      profiles: [
        {
          id: 'WATCH',
          name: 'Watch Risk Profile',
          riskCategory: 'WATCH',
          badgeColor: 'amber',
          description: '1 pending arrear, 72% attendance in 1 course, borderline internal test marks (CAT-1 ~28/50). Recommended for early intervention demonstrations.',
        },
        {
          id: 'CRITICAL',
          name: 'Critical Risk Profile',
          riskCategory: 'CRITICAL',
          badgeColor: 'rose',
          description: '2-3 pending arrears, attendance <70%, sub-50% CAT scores. Demonstrates high urgency academic interventions and remediation workflows.',
        },
        {
          id: 'SAFE',
          name: 'High Achiever Profile',
          riskCategory: 'SAFE',
          badgeColor: 'emerald',
          description: '0 arrears, >90% attendance across all subjects, CGPA >8.8. Shows healthy academic trajectory and Dean list course progression.',
        },
      ],
    },
  });
});

// 16. Populate Predefined Data for Authenticated Student
router.post('/populate-sample-data', async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = getStudentId(req);
    const profileType = (req.body.profileType || 'WATCH') as SampleProfileType;

    const result = await StudentSampleDataService.populatePredefinedData(studentId, profileType);

    res.status(200).json({
      success: true,
      message: `Predefined academic profile (${profileType}) successfully provisioned.`,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to populate predefined data' },
    });
  }
});

export default router;
