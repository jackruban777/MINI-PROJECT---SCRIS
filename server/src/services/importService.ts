import { prisma } from '../lib/prisma';

export interface RowValidationResult {
  rowNumber: number;
  data: Record<string, any>;
  valid: boolean;
  errors: string[];
  conflict: boolean;
  conflictDetails?: string;
}

export interface ValidationSummary {
  importType: 'INTERNAL_MARKS' | 'SEMESTER_RESULTS' | 'ATTENDANCE';
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  conflictRowsCount: number;
  rows: RowValidationResult[];
  canCommit: boolean;
}

export class AcademicImportService {
  /**
   * Parse CSV content into structured rows
   */
  public static parseCSV(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      throw new Error('CSV file must contain a header line and at least one data row.');
    }

    const headers = lines[0]
      .split(',')
      .map((h) => h.trim().replace(/^"|"$/g, '').trim());
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i]
        .split(',')
        .map((v) => v.trim().replace(/^"|"$/g, '').trim());
      const row: Record<string, string> = {};
      headers.forEach((h, index) => {
        row[h] = values[index] !== undefined ? values[index] : '';
      });
      rows.push(row);
    }

    return { headers, rows };
  }

  /**
   * Dry-run validation of academic data before commit
   */
  public static async validateData(
    importType: 'INTERNAL_MARKS' | 'SEMESTER_RESULTS' | 'ATTENDANCE',
    rows: Record<string, string>[],
    departmentScope?: string
  ): Promise<ValidationSummary> {
    const validatedRows: RowValidationResult[] = [];

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];
      const errors: string[] = [];
      let conflict = false;
      let conflictDetails = '';

      const regNo = raw.registerNumber || raw.RegisterNumber || raw.regNo;
      const subCode = raw.subjectCode || raw.SubjectCode || raw.code;

      if (!regNo) errors.push('Missing student register number');
      if (!subCode) errors.push('Missing subject code');

      let studentId = '';
      let subjectId = '';

      if (regNo && subCode) {
        const student = await prisma.student.findUnique({
          where: { registerNumber: regNo },
          include: { user: true },
        });

        if (!student) {
          errors.push(`Student with register number "${regNo}" not found in institutional directory`);
        } else if (departmentScope && student.user.department !== departmentScope) {
          errors.push(`Student "${regNo}" belongs to ${student.user.department}, outside your department scope`);
        } else {
          studentId = student.id;
        }

        const subject = await prisma.subject.findFirst({
          where: { code: subCode },
        });

        if (!subject) {
          errors.push(`Subject code "${subCode}" does not exist in curriculum catalogue`);
        } else {
          subjectId = subject.id;
        }
      }

      // Type-specific field checks and conflict checks
      if (importType === 'INTERNAL_MARKS') {
        const assessmentType = raw.assessmentType || raw.type || 'CAT-1';
        const score = parseFloat(raw.score);
        const maxScore = parseFloat(raw.maxScore || '50');

        if (isNaN(score) || score < 0) errors.push('Score must be a positive number');
        if (isNaN(maxScore) || maxScore <= 0) errors.push('Max score must be greater than 0');
        if (score > maxScore) errors.push(`Score (${score}) exceeds maximum score (${maxScore})`);

        if (studentId && subjectId) {
          const existing = await prisma.internalAssessment.findFirst({
            where: { studentId, subjectId, assessmentType },
          });
          if (existing) {
            conflict = true;
            conflictDetails = `An existing ${assessmentType} mark (${existing.score}/${existing.maxScore}) exists for this subject.`;
          }
        }
      } else if (importType === 'SEMESTER_RESULTS') {
        const sem = parseInt(raw.semester, 10);
        const grade = (raw.grade || '').toUpperCase().trim();
        const gradePoint = parseFloat(raw.gradePoint);
        const credits = parseInt(raw.credits || '3', 10);
        const status = (raw.status || '').toUpperCase().trim();

        if (isNaN(sem) || sem < 1 || sem > 8) errors.push('Semester must be an integer between 1 and 8');
        if (!['O', 'A+', 'A', 'B+', 'B', 'C', 'RA', 'U', 'AB'].includes(grade)) {
          errors.push(`Invalid institutional grade "${grade}". Must be O, A+, A, B+, B, C, or RA`);
        }
        if (isNaN(gradePoint) || gradePoint < 0 || gradePoint > 10) errors.push('Grade point must be between 0 and 10');
        if (isNaN(credits) || credits <= 0) errors.push('Credits must be a positive integer');
        if (!['PASS', 'FAIL'].includes(status)) errors.push('Result status must be PASS or FAIL');

        if (studentId && subjectId && !isNaN(sem)) {
          const existing = await prisma.semesterResult.findFirst({
            where: { studentId, subjectId, semester: sem },
          });
          if (existing) {
            conflict = true;
            conflictDetails = `A semester result (Grade ${existing.grade}) already exists for semester ${sem}.`;
          }
        }
      } else if (importType === 'ATTENDANCE') {
        const sem = parseInt(raw.semester, 10);
        const attended = parseInt(raw.attendedClasses || raw.attended, 10);
        const total = parseInt(raw.totalClasses || raw.total, 10);

        if (isNaN(sem) || sem < 1 || sem > 8) errors.push('Semester must be an integer between 1 and 8');
        if (isNaN(attended) || attended < 0) errors.push('Attended classes must be \u2265 0');
        if (isNaN(total) || total <= 0) errors.push('Total classes must be > 0');
        if (attended > total) errors.push('Attended classes cannot exceed total classes');

        if (studentId && subjectId && !isNaN(sem)) {
          const existing = await prisma.attendanceRecord.findUnique({
            where: { studentId_subjectId_semester: { studentId, subjectId, semester: sem } },
          });
          if (existing) {
            conflict = true;
            conflictDetails = `An attendance record (${existing.percentage}%) already exists for semester ${sem}.`;
          }
        }
      }

      validatedRows.push({
        rowNumber: i + 1,
        data: raw,
        valid: errors.length === 0,
        errors,
        conflict,
        conflictDetails: conflictDetails || undefined,
      });
    }

    const validRowsCount = validatedRows.filter((r) => r.valid).length;
    const invalidRowsCount = validatedRows.filter((r) => !r.valid).length;
    const conflictRowsCount = validatedRows.filter((r) => r.conflict).length;

    return {
      importType,
      totalRows: rows.length,
      validRowsCount,
      invalidRowsCount,
      conflictRowsCount,
      rows: validatedRows,
      canCommit: validRowsCount > 0,
    };
  }

  /**
   * Commit validated rows in a database transaction with audit provenance
   */
  public static async commitImport(
    actorId: string,
    filename: string,
    importType: 'INTERNAL_MARKS' | 'SEMESTER_RESULTS' | 'ATTENDANCE',
    validRows: RowValidationResult[],
    overwriteConflicts: boolean = false
  ): Promise<{ batchId: string; successCount: number; errorCount: number; summary: string }> {
    let successCount = 0;
    let errorCount = 0;
    const errors: { row: number; reason: string }[] = [];

    await prisma.$transaction(async (tx) => {
      for (const row of validRows) {
        if (!row.valid) {
          errorCount++;
          errors.push({ row: row.rowNumber, reason: row.errors.join('; ') });
          continue;
        }

        if (row.conflict && !overwriteConflicts) {
          errorCount++;
          errors.push({ row: row.rowNumber, reason: 'Skipped due to existing record conflict' });
          continue;
        }

        try {
          const regNo = row.data.registerNumber || row.data.RegisterNumber || row.data.regNo;
          const subCode = row.data.subjectCode || row.data.SubjectCode || row.data.code;

          const student = await tx.student.findUnique({ where: { registerNumber: regNo } });
          const subject = await tx.subject.findFirst({ where: { code: subCode } });

          if (!student || !subject) {
            errorCount++;
            continue;
          }

          if (importType === 'INTERNAL_MARKS') {
            const assessmentType = row.data.assessmentType || row.data.type || 'CAT-1';
            const score = parseFloat(row.data.score);
            const maxScore = parseFloat(row.data.maxScore || '50');
            const assessmentDate = row.data.date ? new Date(row.data.date) : new Date();

            if (row.conflict && overwriteConflicts) {
              await tx.internalAssessment.deleteMany({
                where: { studentId: student.id, subjectId: subject.id, assessmentType },
              });
            }

            await tx.internalAssessment.create({
              data: {
                studentId: student.id,
                subjectId: subject.id,
                assessmentType,
                score,
                maxScore,
                assessmentDate,
              },
            });
            successCount++;
          } else if (importType === 'SEMESTER_RESULTS') {
            const sem = parseInt(row.data.semester, 10);
            const grade = row.data.grade.toUpperCase().trim();
            const gradePoint = parseFloat(row.data.gradePoint);
            const credits = parseInt(row.data.credits || String(subject.credits), 10);
            const status = row.data.status.toUpperCase().trim();
            const attemptNumber = parseInt(row.data.attemptNumber || '1', 10);

            if (row.conflict && overwriteConflicts) {
              await tx.semesterResult.deleteMany({
                where: { studentId: student.id, subjectId: subject.id, semester: sem },
              });
            }

            await tx.semesterResult.create({
              data: {
                studentId: student.id,
                subjectId: subject.id,
                semester: sem,
                grade,
                gradePoint,
                credits,
                attemptNumber,
                status,
              },
            });

            // Update arrears automatically if FAIL
            if (status === 'FAIL') {
              const existingArrear = await tx.arrear.findFirst({
                where: { studentId: student.id, subjectId: subject.id, status: 'PENDING' },
              });
              if (!existingArrear) {
                await tx.arrear.create({
                  data: {
                    studentId: student.id,
                    subjectId: subject.id,
                    originalSemester: sem,
                    attempts: attemptNumber,
                    status: 'PENDING',
                  },
                });
              }
            } else if (status === 'PASS') {
              // Clear pending arrear if pass
              await tx.arrear.updateMany({
                where: { studentId: student.id, subjectId: subject.id, status: 'PENDING' },
                data: { status: 'CLEARED', clearedAt: new Date() },
              });
            }

            successCount++;
          } else if (importType === 'ATTENDANCE') {
            const sem = parseInt(row.data.semester, 10);
            const attended = parseInt(row.data.attendedClasses || row.data.attended, 10);
            const total = parseInt(row.data.totalClasses || row.data.total, 10);
            const percentage = Number(((attended / total) * 100).toFixed(1));

            await tx.attendanceRecord.upsert({
              where: {
                studentId_subjectId_semester: {
                  studentId: student.id,
                  subjectId: subject.id,
                  semester: sem,
                },
              },
              create: {
                studentId: student.id,
                subjectId: subject.id,
                semester: sem,
                attendedClasses: attended,
                totalClasses: total,
                percentage,
              },
              update: {
                attendedClasses: attended,
                totalClasses: total,
                percentage,
              },
            });
            successCount++;
          }
        } catch (err: any) {
          errorCount++;
          errors.push({ row: row.rowNumber, reason: err.message || 'Database write error' });
        }
      }
    });

    // Record in AcademicImportBatch
    const batch = await prisma.academicImportBatch.create({
      data: {
        actorId,
        importType,
        filename,
        totalRows: validRows.length,
        successRows: successCount,
        errorRows: errorCount,
        status: errorCount === 0 ? 'COMPLETED' : successCount > 0 ? 'PARTIAL' : 'FAILED',
        errorsJson: errors.length > 0 ? JSON.stringify(errors) : null,
      },
    });

    // Record in AuditLog
    await prisma.auditLog.create({
      data: {
        actorId,
        entityType: 'AcademicImportBatch',
        entityId: batch.id,
        action: 'IMPORT_ACADEMIC_DATA',
        metadata: JSON.stringify({
          importType,
          filename,
          successCount,
          errorCount,
        }),
      },
    });

    return {
      batchId: batch.id,
      successCount,
      errorCount,
      summary: `Successfully imported ${successCount} record(s). ${errorCount} error(s) or skipped conflicts.`,
    };
  }
}
