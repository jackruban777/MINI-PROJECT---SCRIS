import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { StudentSampleDataService } from '../services/studentSampleDataService';

export async function setupPredefinedUsers() {
  console.log('🔧 Setting up predefined Admin Student and Admin Faculty accounts...');

  const studentPassHash = await bcrypt.hash('11111111', 10);
  const teacherPassHash = await bcrypt.hash('22222222', 10);

  // 1. Setup Faculty Admin (admint@gmail.com / 22222222)
  let teacherUser = await prisma.user.findUnique({
    where: { email: 'admint@gmail.com' },
    include: { teacherProfile: true },
  });

  if (!teacherUser) {
    // Check if staffId already used
    const existingStaff = await prisma.teacher.findUnique({ where: { staffId: 'ADM-FAC-001' } });
    if (existingStaff) {
      await prisma.teacher.delete({ where: { staffId: 'ADM-FAC-001' } });
    }

    teacherUser = await prisma.user.create({
      data: {
        name: 'Administrator Faculty',
        email: 'admint@gmail.com',
        passwordHash: teacherPassHash,
        role: 'TEACHER',
        department: 'Computer Science and Engineering',
        teacherProfile: {
          create: {
            staffId: 'ADM-FAC-001',
            designation: 'Professor & Academic Dean',
            department: 'Computer Science and Engineering',
          },
        },
      },
      include: { teacherProfile: true },
    });
    console.log('✅ Created Faculty account: admint@gmail.com (Password: 22222222)');
  } else {
    // Update password & profile
    teacherUser = await prisma.user.update({
      where: { email: 'admint@gmail.com' },
      data: {
        passwordHash: teacherPassHash,
        role: 'TEACHER',
        teacherProfile: teacherUser.teacherProfile
          ? undefined
          : {
              create: {
                staffId: 'ADM-FAC-001',
                designation: 'Professor & Academic Dean',
                department: 'Computer Science and Engineering',
              },
            },
      },
      include: { teacherProfile: true },
    });
    console.log('✅ Updated Faculty account: admint@gmail.com (Password: 22222222)');
  }

  // 2. Setup Student Admin (admin@gmail.com / 11111111)
  let studentUser = await prisma.user.findUnique({
    where: { email: 'admin@gmail.com' },
    include: { studentProfile: true },
  });

  if (!studentUser) {
    // Check if registerNumber already used
    const existingReg = await prisma.student.findUnique({ where: { registerNumber: '21CSRADMIN' } });
    if (existingReg) {
      await prisma.student.delete({ where: { registerNumber: '21CSRADMIN' } });
    }

    studentUser = await prisma.user.create({
      data: {
        name: 'Administrator Student',
        email: 'admin@gmail.com',
        passwordHash: studentPassHash,
        role: 'STUDENT',
        department: 'Computer Science and Engineering',
        studentProfile: {
          create: {
            registerNumber: '21CSRADMIN',
            degree: 'B.Tech Computer Science and Engineering',
            batchYear: 2023,
            currentSemester: 5,
            section: 'A',
            advisorId: teacherUser.teacherProfile?.id,
            phone: '+91 98401 11111',
          },
        },
      },
      include: { studentProfile: true },
    });
    console.log('✅ Created Student account: admin@gmail.com (Password: 11111111)');
  } else {
    studentUser = await prisma.user.update({
      where: { email: 'admin@gmail.com' },
      data: {
        passwordHash: studentPassHash,
        role: 'STUDENT',
        studentProfile: studentUser.studentProfile
          ? {
              update: {
                advisorId: teacherUser.teacherProfile?.id,
              },
            }
          : {
              create: {
                registerNumber: '21CSRADMIN',
                degree: 'B.Tech Computer Science and Engineering',
                batchYear: 2023,
                currentSemester: 5,
                section: 'A',
                advisorId: teacherUser.teacherProfile?.id,
                phone: '+91 98401 11111',
              },
            },
      },
      include: { studentProfile: true },
    });
    console.log('✅ Updated Student account: admin@gmail.com (Password: 11111111)');
  }

  // Populate realistic academic demo data for the student
  if (studentUser.studentProfile?.id) {
    try {
      await StudentSampleDataService.populatePredefinedData(studentUser.studentProfile.id, 'WATCH');
      console.log('✅ Populated comprehensive academic data for admin@gmail.com');
    } catch (err) {
      console.warn('Notice while populating student sample data:', err);
    }
  }

  console.log('🎉 Predefined accounts are fully active and ready to log in!');
}

if (require.main === module || process.argv[1]?.includes('setupAdminUsers')) {
  setupPredefinedUsers()
    .catch((err) => {
      console.error('Setup failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
