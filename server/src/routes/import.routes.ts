import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/role';
import { AcademicImportService } from '../services/importService';

const router = Router();

// Strict authorization: Only Faculty & Admins can access academic imports
router.use(authenticate);
router.use(requireRole(['TEACHER', 'ADMIN']));

// 1. Dry-run CSV Validation & Preview
router.post('/validate', async (req: Request, res: Response): Promise<void> => {
  const { importType, csvContent } = req.body;

  if (!importType || !['INTERNAL_MARKS', 'SEMESTER_RESULTS', 'ATTENDANCE'].includes(importType)) {
    res.status(400).json({ success: false, error: { message: 'Invalid or missing importType.' } });
    return;
  }

  if (!csvContent || typeof csvContent !== 'string') {
    res.status(400).json({ success: false, error: { message: 'CSV text content is required.' } });
    return;
  }

  try {
    const { headers, rows } = AcademicImportService.parseCSV(csvContent);
    const departmentScope = req.user!.role === 'ADMIN' ? undefined : req.user!.department;

    const validationSummary = await AcademicImportService.validateData(importType, rows, departmentScope);

    res.status(200).json({
      success: true,
      data: {
        headers,
        summary: validationSummary,
      },
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: { message: err.message || 'Failed to parse CSV file.' },
    });
  }
});

// 2. Transactional Commit of Validated Data
router.post('/commit', async (req: Request, res: Response): Promise<void> => {
  const { importType, filename, validRows, overwriteConflicts } = req.body;

  if (!importType || !Array.isArray(validRows) || validRows.length === 0) {
    res.status(400).json({ success: false, error: { message: 'Valid rows array and importType are required.' } });
    return;
  }

  try {
    const result = await AcademicImportService.commitImport(
      req.user!.userId,
      filename || `import_${Date.now()}.csv`,
      importType,
      validRows,
      !!overwriteConflicts
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { message: err.message || 'Transactional import failed.' },
    });
  }
});

// 3. Import Batch History
router.get('/history', async (req: Request, res: Response): Promise<void> => {
  const batches = await prisma.academicImportBatch.findMany({
    include: {
      actor: { select: { name: true, email: true, department: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  res.status(200).json({
    success: true,
    data: { batches },
  });
});

// 4. Downloadable Sample CSV Templates
router.get('/template/:type', (req: Request, res: Response): void => {
  const { type } = req.params;

  let filename = 'import_template.csv';
  let csvData = '';

  if (type === 'INTERNAL_MARKS') {
    filename = 'template_internal_marks.csv';
    csvData = `registerNumber,subjectCode,assessmentType,score,maxScore,date\n21CSR042,CS3591,CAT-1,42,50,2026-09-10\n21CSR042,CS3591,Assignment,18,20,2026-09-25\n21CSR089,CS3501,CAT-1,38,50,2026-09-10`;
  } else if (type === 'SEMESTER_RESULTS') {
    filename = 'template_semester_results.csv';
    csvData = `registerNumber,subjectCode,semester,grade,gradePoint,credits,status,attemptNumber\n21CSR042,CS3451,4,A,8,3,PASS,1\n21CSR042,CS3401,4,B+,7,4,PASS,1\n21CSR089,CS3301,3,RA,0,3,FAIL,1`;
  } else if (type === 'ATTENDANCE') {
    filename = 'template_attendance.csv';
    csvData = `registerNumber,subjectCode,semester,attendedClasses,totalClasses\n21CSR042,CS3591,5,42,50\n21CSR042,CS3501,5,45,50\n21CSR089,CS3591,5,34,50`;
  } else {
    res.status(400).json({ success: false, error: { message: 'Unknown template type' } });
    return;
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.send(csvData);
});

export default router;
