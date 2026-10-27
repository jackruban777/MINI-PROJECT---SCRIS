import { prisma } from '../lib/prisma';
import { AcademicRiskEngine } from './riskEngine';

export type SampleProfileType = 'WATCH' | 'CRITICAL' | 'SAFE' | 'SAFE_HIGH';

export interface PopulateOptions {
  profileType?: SampleProfileType;
}

export class StudentSampleDataService {
  /**
   * Populate realistic predefined academic records for a student profile
   */
  static async populatePredefinedData(studentId: string, profileType: SampleProfileType = 'WATCH') {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
      },
    });

    if (!student) {
      throw new Error(`Student with ID ${studentId} not found.`);
    }

    const targetDepartment = student.user.department || 'Computer Science and Engineering';
    const currentSem = student.currentSemester || 5;

    // 1. Find appropriate faculty advisor for this department
    let advisor = await prisma.teacher.findFirst({
      where: {
        department: targetDepartment,
      },
      include: { user: true },
    });

    if (!advisor) {
      advisor = await prisma.teacher.findFirst({
        include: { user: true },
      });
    }

    const advisorId = advisor?.id || null;

    // Update student's advisor and user department if needed
    await prisma.student.update({
      where: { id: studentId },
      data: {
        advisor: advisorId ? { connect: { id: advisorId } } : undefined,
        user: {
          update: {
            department: targetDepartment,
          },
        },
      },
    });

    // 2. Clean existing records for this student to avoid collisions/orphans
    await prisma.riskSnapshot.deleteMany({ where: { studentId } });
    await prisma.intervention.deleteMany({ where: { studentId } });
    await prisma.arrear.deleteMany({ where: { studentId } });
    await prisma.attendanceRecord.deleteMany({ where: { studentId } });
    await prisma.semesterResult.deleteMany({ where: { studentId } });
    await prisma.internalAssessment.deleteMany({ where: { studentId } });
    await prisma.enrollment.deleteMany({ where: { studentId } });
    await prisma.notification.deleteMany({ where: { userId: student.userId } });

    // 3. Find current and past subjects for this department
    const allSubjects = await prisma.subject.findMany({
      where: { department: targetDepartment },
      orderBy: [{ semester: 'asc' }, { code: 'asc' }],
    });

    const currentSubs = allSubjects.filter((s) => s.semester === currentSem);
    const prevSubs = allSubjects.filter((s) => s.semester < currentSem);

    // Fallback if current semester subjects aren't present
    const activeSubjects = currentSubs.length > 0 ? currentSubs : allSubjects.slice(0, 6);
    const pastSubjects = prevSubs.length > 0 ? prevSubs : allSubjects.slice(6);

    // 4. Enroll in active semester subjects
    for (const sub of activeSubjects) {
      await prisma.enrollment.create({
        data: {
          studentId,
          subjectId: sub.id,
          semester: currentSem,
          status: 'ACTIVE',
        },
      });
    }

    // 5. Populate realistic Attendance Records (50 total classes per course)
    const totalClasses = 50;
    for (let i = 0; i < activeSubjects.length; i++) {
      const sub = activeSubjects[i];
      let attended = 44;

      if (profileType === 'CRITICAL') {
        // High deficit: 28-36 classes attended (56% - 72%)
        attended = i === 0 ? 31 : i === 1 ? 34 : Math.floor(Math.random() * 5) + 32;
      } else if (profileType === 'WATCH') {
        // Borderline: 1 subject under threshold (72%), others 78% - 84%
        attended = i === 0 ? 36 : Math.floor(Math.random() * 4) + 40;
      } else {
        // Safe: 90% - 98%
        attended = Math.floor(Math.random() * 4) + 45;
      }

      const percentage = Number(((attended / totalClasses) * 100).toFixed(1));

      await prisma.attendanceRecord.create({
        data: {
          studentId,
          subjectId: sub.id,
          semester: currentSem,
          attendedClasses: attended,
          totalClasses,
          percentage,
        },
      });
    }

    // 6. Populate Internal Assessments (CAT-1 max 50, Assignment max 20)
    for (let i = 0; i < activeSubjects.length; i++) {
      const sub = activeSubjects[i];
      let cat1Score = 36;
      let assignScore = 16;

      if (profileType === 'CRITICAL') {
        cat1Score = i === 0 ? 19 : i === 1 ? 22 : Math.floor(Math.random() * 8) + 18; // Sub-50%
        assignScore = Math.floor(Math.random() * 5) + 9; // 9-13 / 20
      } else if (profileType === 'WATCH') {
        cat1Score = i === 0 ? 27 : i === 1 ? 29 : Math.floor(Math.random() * 6) + 32; // 27-38 / 50
        assignScore = Math.floor(Math.random() * 4) + 14; // 14-17 / 20
      } else {
        cat1Score = Math.floor(Math.random() * 6) + 42; // 42-47 / 50
        assignScore = Math.floor(Math.random() * 2) + 18; // 18-20 / 20
      }

      await prisma.internalAssessment.create({
        data: {
          studentId,
          subjectId: sub.id,
          assessmentType: 'CAT-1',
          score: cat1Score,
          maxScore: 50,
          assessmentDate: new Date('2026-08-25'),
        },
      });

      await prisma.internalAssessment.create({
        data: {
          studentId,
          subjectId: sub.id,
          assessmentType: 'Assignment',
          score: assignScore,
          maxScore: 20,
          assessmentDate: new Date('2026-09-15'),
        },
      });
    }

    // 7. Populate Previous Semester Results & Pending Arrears
    for (let i = 0; i < pastSubjects.length; i++) {
      const pSub = pastSubjects[i];
      let grade = 'A';
      let gradePoint = 8;
      let status = 'PASS';

      if (profileType === 'CRITICAL') {
        // 2-3 failures in prior semesters
        if (i < 2) {
          grade = 'RA';
          gradePoint = 0;
          status = 'FAIL';
        } else if (i === 2) {
          grade = 'C';
          gradePoint = 5;
        } else {
          grade = 'B';
          gradePoint = 6;
        }
      } else if (profileType === 'WATCH') {
        // 1 failure (arrear), rest moderate grades
        if (i === 0) {
          grade = 'RA';
          gradePoint = 0;
          status = 'FAIL';
        } else if (i === 1) {
          grade = 'B';
          gradePoint = 6;
        } else {
          grade = 'B+';
          gradePoint = 7;
        }
      } else {
        // Safe / High achiever
        grade = i % 2 === 0 ? 'O' : 'A+';
        gradePoint = grade === 'O' ? 10 : 9;
      }

      await prisma.semesterResult.create({
        data: {
          studentId,
          subjectId: pSub.id,
          semester: pSub.semester,
          grade,
          gradePoint,
          credits: pSub.credits,
          status,
          attemptNumber: 1,
        },
      });

      // Create Arrear record if failed
      if (status === 'FAIL') {
        await prisma.arrear.create({
          data: {
            studentId,
            subjectId: pSub.id,
            originalSemester: pSub.semester,
            attempts: 1,
            deadlineSemester: pSub.semester + 4,
            status: 'PENDING',
          },
        });
      }
    }

    // 8. Create Interventions if Watch or Critical
    if (advisorId && (profileType === 'CRITICAL' || profileType === 'WATCH')) {
      const notes =
        profileType === 'CRITICAL'
          ? 'Urgent faculty meeting conducted: Identified attendance deficiency and 2 arrears. Scheduled weekly remedial mentoring sessions.'
          : 'Proactive advising discussion: Borderline internal marks in core theory course. Advised structured revision timetable.';

      await prisma.intervention.create({
        data: {
          studentId,
          staffId: advisorId,
          type: 'Academic Counselling & Remedial Plan',
          notes,
          followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'OPEN',
        },
      });
    }

    // 9. Create Official Institutional Notifications
    await prisma.notification.create({
      data: {
        userId: student.userId,
        type: 'ACADEMIC_ALERT',
        title: `Academic Predefined Profile Loaded: ${profileType}`,
        message:
          profileType === 'CRITICAL'
            ? 'Critical course completion risk detected. Attendance and arrear warnings are active. Please schedule an advisor meeting.'
            : profileType === 'WATCH'
            ? 'Continuous assessment and attendance records have been initialized. 1 subject requires targeted score improvement in CAT-2.'
            : 'Predefined high-achiever academic records verified. Course trajectory is safe and on track for graduation.',
      },
    });

    await prisma.notification.create({
      data: {
        userId: student.userId,
        type: 'EXAM_SCHEDULE',
        title: 'Upcoming Assessment Cycle: CAT-2',
        message: 'Continuous Assessment Test 2 schedules have been finalized. Check your timetable for hall allocations.',
      },
    });

    if (advisor) {
      await prisma.notification.create({
        data: {
          userId: student.userId,
          type: 'ADVISOR_UPDATE',
          title: `Faculty Advisor Assigned: ${advisor.user.name}`,
          message: `${advisor.user.name} (${advisor.user.email}) has been designated as your institutional academic advisor.`,
        },
      });
    }

    // 10. Ensure section timetable exists
    let timetable = await prisma.timetable.findFirst({
      where: {
        department: targetDepartment,
        semester: currentSem,
        section: student.section || 'A',
      },
    });

    if (!timetable) {
      timetable = await prisma.timetable.create({
        data: {
          department: targetDepartment,
          semester: currentSem,
          section: student.section || 'A',
          academicYear: '2025-2026',
        },
      });
    }

    // Check if exam entries exist in timetable, if not create sample exam dates
    const examEntriesCount = await prisma.timetableEntry.count({
      where: {
        timetableId: timetable.id,
        entryType: 'INTERNAL_ASSESSMENT',
      },
    });

    if (examEntriesCount === 0 && activeSubjects.length > 0) {
      const examDates = [
        new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
      ];

      for (let i = 0; i < Math.min(3, activeSubjects.length); i++) {
        await prisma.timetableEntry.create({
          data: {
            timetableId: timetable.id,
            entryType: 'INTERNAL_ASSESSMENT',
            startTime: '09:30',
            endTime: '12:30',
            room: 'Exam Hall A-101',
            subjectId: activeSubjects[i].id,
            examDate: examDates[i],
            description: `CAT-2 Examination for ${activeSubjects[i].name}`,
          },
        });
      }
    }

    // 11. Run deterministic AcademicRiskEngine calculation
    const calculatedRisk = await AcademicRiskEngine.assessStudentRisk(studentId);

    return {
      success: true,
      profileType,
      studentName: student.user.name,
      department: targetDepartment,
      enrolledSubjectsCount: activeSubjects.length,
      calculatedRisk,
    };
  }
}
