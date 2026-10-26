import { PrismaClient } from '@prisma/client';
import { AcademicRiskEngine } from '../services/riskEngine';
import { StudentSampleDataService } from '../services/studentSampleDataService';

const prisma = new PrismaClient();

const subjectMapping: Record<string, { newCode: string; dept: string }> = {
  // CSE mapping
  CS501: { newCode: 'CS3501', dept: 'Computer Science and Engineering' }, // Compiler Design
  CS502: { newCode: 'CS3492', dept: 'Computer Science and Engineering' }, // Database Management Systems
  CS503: { newCode: 'CS3591', dept: 'Computer Science and Engineering' }, // Computer Networks
  CS504: { newCode: 'CS3452', dept: 'Computer Science and Engineering' }, // Theory of Computation
  CS505: { newCode: 'CS3561', dept: 'Computer Science and Engineering' }, // Compiler Design Laboratory
  CS301: { newCode: 'CS3301', dept: 'Computer Science and Engineering' }, // Data Structures
  CS302: { newCode: 'CS3351', dept: 'Computer Science and Engineering' }, // Digital Principles
  CS401: { newCode: 'CS3451', dept: 'Computer Science and Engineering' }, // Operating Systems
  CS402: { newCode: 'CS3391', dept: 'Computer Science and Engineering' }, // Object Oriented Programming

  // IT mapping
  IT501: { newCode: 'IT3501', dept: 'Information Technology' }, // Full Stack Web Development
  IT502: { newCode: 'CCS335', dept: 'Information Technology' }, // Cloud Services
  IT503: { newCode: 'CB3491', dept: 'Information Technology' }, // Cryptography and Cyber Security
  IT504: { newCode: 'IT3502', dept: 'Information Technology' }, // Design & Analysis of Algorithms
  IT505: { newCode: 'IT3511', dept: 'Information Technology' }, // Web Development Lab
  IT301: { newCode: 'IT3301', dept: 'Information Technology' }, // Data Structures and Algorithms
  IT401: { newCode: 'CS3351', dept: 'Information Technology' }, // Digital Principles
};

async function migrate() {
  console.log('🔄 Migrating all student records to official Anna University subjects...');

  for (const [oldCode, target] of Object.entries(subjectMapping)) {
    const oldSub = await prisma.subject.findFirst({
      where: { code: oldCode },
    });

    if (!oldSub) continue;

    const newSub = await prisma.subject.findFirst({
      where: {
        code: target.newCode,
        department: target.dept,
      },
    });

    if (!newSub) {
      console.warn(`Target Anna University subject ${target.newCode} not found in ${target.dept}`);
      continue;
    }

    console.log(`Mapping ${oldCode} (${oldSub.id}) -> ${target.newCode} (${newSub.id})`);

    // 1. Update enrollments
    await prisma.enrollment.updateMany({
      where: { subjectId: oldSub.id },
      data: { subjectId: newSub.id },
    });

    // 2. Update attendance
    await prisma.attendanceRecord.updateMany({
      where: { subjectId: oldSub.id },
      data: { subjectId: newSub.id },
    });

    // 3. Update internal assessments
    await prisma.internalAssessment.updateMany({
      where: { subjectId: oldSub.id },
      data: { subjectId: newSub.id },
    });

    // 4. Update semester results
    await prisma.semesterResult.updateMany({
      where: { subjectId: oldSub.id },
      data: { subjectId: newSub.id },
    });

    // 5. Update arrears
    await prisma.arrear.updateMany({
      where: { subjectId: oldSub.id },
      data: { subjectId: newSub.id },
    });

    // 6. Update timetable entries
    await prisma.timetableEntry.updateMany({
      where: { subjectId: oldSub.id },
      data: { subjectId: newSub.id },
    });

    // Now safely delete old placeholder subject
    await prisma.subject.delete({
      where: { id: oldSub.id },
    });
  }

  console.log('✅ Old placeholder subjects safely removed.');

  // Repopulate Jack's account with Anna University Semester 5 courses
  const jack = await prisma.user.findFirst({
    where: { email: 'jack@gmail.com' },
    include: { studentProfile: true },
  });

  if (jack?.studentProfile) {
    console.log("Repopulating Jack's account with Anna University courses...");
    await StudentSampleDataService.populatePredefinedData(jack.studentProfile.id, 'WATCH');
  }

  // Recalculate risk snapshots for all students
  const students = await prisma.student.findMany();
  console.log(`Recalculating risk snapshots for ${students.length} students...`);
  for (const s of students) {
    try {
      await AcademicRiskEngine.assessStudentRisk(s.id);
    } catch (e) {
      // ignore individual failures
    }
  }

  const remainingSubjects = await prisma.subject.count();
  console.log(`🎓 Total Anna University subjects in catalog: ${remainingSubjects}`);
}

migrate()
  .catch((e) => console.error('Migration error:', e))
  .finally(() => prisma.$disconnect());
