import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middlewares/auth';
import { AcademicRiskEngine } from '../services/riskEngine';
import { PDFReportService } from '../lib/pdf';
import { CSVExportService } from '../lib/csv';

const router = Router();

router.use(authenticate);

// 1. Student Academic Progress Report PDF
router.get('/student-pdf', async (req: Request, res: Response): Promise<void> => {
  let targetStudentId = req.query.studentId as string | undefined;

  // If requester is a student, enforce self-ownership
  if (req.user!.role === 'STUDENT') {
    targetStudentId = req.user!.studentId;
  } else if (!targetStudentId) {
    res.status(400).json({ success: false, error: { message: 'Student ID is required.' } });
    return;
  }

  const student = await prisma.student.findUnique({
    where: { id: targetStudentId },
    include: {
      user: true,
      internalAssessments: { include: { subject: true } },
      semesterResults: { include: { subject: true } },
      attendanceRecords: { include: { subject: true } },
      arrears: { include: { subject: true } },
    },
  });

  if (!student) {
    res.status(404).json({ success: false, error: { message: 'Student record not found.' } });
    return;
  }

  // Teacher scope check
  if (req.user!.role === 'TEACHER' && req.user!.department !== student.user.department) {
    res.status(403).json({ success: false, error: { message: 'Unauthorized: Student is outside your department scope.' } });
    return;
  }

  const riskData = await AcademicRiskEngine.assessStudentRisk(student.id);

  const pdfBuffer = await PDFReportService.generateStudentReport(
    {
      name: student.user.name,
      registerNumber: student.registerNumber,
      degree: student.degree,
      department: student.user.department,
      currentSemester: student.currentSemester,
      section: student.section,
    },
    riskData,
    student.semesterResults,
    student.attendanceRecords
  );

  // Log report generation in audit log
  await prisma.auditLog.create({
    data: {
      actorId: req.user!.userId,
      entityType: 'Report',
      entityId: student.id,
      action: 'EXPORT_PDF_REPORT',
      metadata: JSON.stringify({ studentRegisterNumber: student.registerNumber }),
    },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=SCRIS_Report_${student.registerNumber}.pdf`);
  res.send(pdfBuffer);
});

// 2. Class Summary CSV (Teacher only)
router.get('/class-csv', async (req: Request, res: Response): Promise<void> => {
  if (req.user!.role !== 'TEACHER' && req.user!.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: { message: 'Only faculty can export class reports.' } });
    return;
  }

  const department = req.user!.department;
  const students = await prisma.student.findMany({
    where: req.user!.role === 'ADMIN' ? {} : { user: { department } },
    include: {
      user: true,
      arrears: { where: { status: 'PENDING' } },
      semesterResults: true,
    },
  });

  const rows: any[] = [];
  for (const s of students) {
    const assessment = await AcademicRiskEngine.assessStudentRisk(s.id);
    rows.push({
      registerNumber: s.registerNumber,
      name: s.user.name,
      department: s.user.department,
      degree: s.degree,
      semester: s.currentSemester,
      section: s.section,
      cgpa: assessment.cgpa.toFixed(2),
      pendingArrears: s.arrears.length,
      riskScore: assessment.score,
      riskCategory: assessment.category,
      explanation: assessment.explanation,
    });
  }

  const csvContent = CSVExportService.generateCSV(
    [
      { key: 'registerNumber', label: 'Register Number' },
      { key: 'name', label: 'Student Name' },
      { key: 'department', label: 'Department' },
      { key: 'degree', label: 'Degree' },
      { key: 'semester', label: 'Semester' },
      { key: 'section', label: 'Section' },
      { key: 'cgpa', label: 'CGPA' },
      { key: 'pendingArrears', label: 'Pending Arrears' },
      { key: 'riskScore', label: 'Risk Score (0-100)' },
      { key: 'riskCategory', label: 'Risk Category' },
      { key: 'explanation', label: 'Risk Explanation' },
    ],
    rows
  );

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=SCRIS_Class_Summary_${department.replace(/\s+/g, '_')}.csv`);
  res.send(csvContent);
});

// 3. At-Risk Students CSV (Teacher only)
router.get('/at-risk-csv', async (req: Request, res: Response): Promise<void> => {
  if (req.user!.role !== 'TEACHER' && req.user!.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: { message: 'Access denied.' } });
    return;
  }

  const department = req.user!.department;
  const students = await prisma.student.findMany({
    where: req.user!.role === 'ADMIN' ? {} : { user: { department } },
    include: {
      user: true,
      arrears: { where: { status: 'PENDING' } },
      interventions: true,
    },
  });

  const atRiskRows: any[] = [];
  for (const s of students) {
    const assessment = await AcademicRiskEngine.assessStudentRisk(s.id);
    if (assessment.category === 'CRITICAL' || assessment.category === 'WATCH') {
      atRiskRows.push({
        registerNumber: s.registerNumber,
        name: s.user.name,
        semester: s.currentSemester,
        section: s.section,
        category: assessment.category,
        score: assessment.score,
        arrears: s.arrears.length,
        explanation: assessment.explanation,
        activeInterventions: s.interventions.filter((i) => i.status !== 'RESOLVED').length,
      });
    }
  }

  atRiskRows.sort((a, b) => b.score - a.score);

  const csvContent = CSVExportService.generateCSV(
    [
      { key: 'registerNumber', label: 'Register Number' },
      { key: 'name', label: 'Student Name' },
      { key: 'semester', label: 'Semester' },
      { key: 'section', label: 'Section' },
      { key: 'category', label: 'Category' },
      { key: 'score', label: 'Risk Index' },
      { key: 'arrears', label: 'Pending Arrears' },
      { key: 'activeInterventions', label: 'Active Interventions' },
      { key: 'explanation', label: 'Risk Factors & Details' },
    ],
    atRiskRows
  );

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=SCRIS_AtRisk_Roster_${department.replace(/\s+/g, '_')}.csv`);
  res.send(csvContent);
});

// 4. Interventions Summary CSV (Teacher only)
router.get('/interventions-csv', async (req: Request, res: Response): Promise<void> => {
  if (req.user!.role !== 'TEACHER' && req.user!.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: { message: 'Access denied.' } });
    return;
  }

  const department = req.user!.department;
  const interventions = await prisma.intervention.findMany({
    where: req.user!.role === 'ADMIN' ? {} : { student: { user: { department } } },
    include: {
      student: { include: { user: true } },
      staff: { include: { user: true } },
      subject: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const rows = interventions.map((item) => ({
    studentName: item.student.user.name,
    registerNumber: item.student.registerNumber,
    semester: item.student.currentSemester,
    type: item.type,
    category: item.category,
    priority: item.priority,
    subject: item.subject ? `${item.subject.code} - ${item.subject.name}` : 'General / Overall',
    advisor: item.staff.user.name,
    status: item.status,
    notes: item.notes.replace(/\r?\n/g, ' '),
    targetDate: item.targetDate ? item.targetDate.toISOString().split('T')[0] : 'None',
    followUpDate: item.followUpDate ? item.followUpDate.toISOString().split('T')[0] : 'None',
    outcome: (item.outcome || '').replace(/\r?\n/g, ' '),
  }));

  const csvContent = CSVExportService.generateCSV(
    [
      { key: 'studentName', label: 'Student Name' },
      { key: 'registerNumber', label: 'Register Number' },
      { key: 'semester', label: 'Semester' },
      { key: 'type', label: 'Intervention Type' },
      { key: 'category', label: 'Category' },
      { key: 'priority', label: 'Priority' },
      { key: 'subject', label: 'Subject Scope' },
      { key: 'advisor', label: 'Assigned Staff' },
      { key: 'status', label: 'Status' },
      { key: 'notes', label: 'Action Details' },
      { key: 'targetDate', label: 'Target Date' },
      { key: 'followUpDate', label: 'Follow-up Date' },
      { key: 'outcome', label: 'Recorded Outcome' },
    ],
    rows
  );

  // Audit log
  await prisma.auditLog.create({
    data: {
      actorId: req.user!.userId,
      entityType: 'Report',
      entityId: 'INTERVENTIONS_REPORT',
      action: 'EXPORT_INTERVENTIONS_CSV',
      metadata: JSON.stringify({ count: rows.length, department }),
    },
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=SCRIS_Interventions_${department.replace(/\s+/g, '_')}.csv`);
  res.send(csvContent);
});

export default router;
