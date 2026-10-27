import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ANNA_UNIVERSITY_CURRICULUM } from '../src/config/annaUniversityCurriculum';
import { setupPredefinedUsers } from '../src/scripts/setupAdminUsers';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive SCRIS database seeding...');

  // Clean existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.emailLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.riskSnapshot.deleteMany();
  await prisma.intervention.deleteMany();
  await prisma.timetableEntry.deleteMany();
  await prisma.timetable.deleteMany();
  await prisma.arrear.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.semesterResult.deleteMany();
  await prisma.internalAssessment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSetting.deleteMany();

  console.log('🧹 Existing records purged cleanly.');

  // Initialize System Settings
  await prisma.systemSetting.createMany({
    data: [
      { key: 'attendance_threshold', value: '75', description: 'Minimum required attendance percentage for semester exam eligibility' },
      { key: 'pass_mark_internal', value: '50', description: 'Passing threshold percentage for internal assessments' },
      { key: 'risk_safe_max', value: '34', description: 'Upper boundary for Safe academic risk category' },
      { key: 'risk_watch_max', value: '64', description: 'Upper boundary for Watch academic risk category' },
    ],
  });

  const facultyPasswordHash = await bcrypt.hash('faculty123', 10);
  const studentPasswordHash = await bcrypt.hash('student123', 10);

  // 1. Create Faculty Users & Profiles
  const teacherUser1 = await prisma.user.create({
    data: {
      name: 'Prof. Rajesh Sharma',
      email: 'prof.sharma@scris.edu',
      passwordHash: facultyPasswordHash,
      role: 'TEACHER',
      department: 'Computer Science and Engineering',
      teacherProfile: {
        create: {
          staffId: 'FAC-CSE-001',
          designation: 'Professor & Head of Department',
          department: 'Computer Science and Engineering',
        },
      },
    },
    include: { teacherProfile: true },
  });

  const teacherUser2 = await prisma.user.create({
    data: {
      name: 'Dr. Anita Desai',
      email: 'dr.anita@scris.edu',
      passwordHash: facultyPasswordHash,
      role: 'TEACHER',
      department: 'Information Technology',
      teacherProfile: {
        create: {
          staffId: 'FAC-IT-002',
          designation: 'Associate Professor & Academic Advisor',
          department: 'Information Technology',
        },
      },
    },
    include: { teacherProfile: true },
  });

  console.log('✅ Faculty accounts provisioned: prof.sharma@scris.edu, dr.anita@scris.edu');

  // 2. Create Anna University Curriculum Subjects across all departments
  const createdSubjects: any[] = [];
  for (const s of ANNA_UNIVERSITY_CURRICULUM) {
    const sub = await prisma.subject.create({
      data: {
        code: s.code,
        name: s.name,
        credits: s.credits,
        semester: s.semester,
        department: s.department,
      },
    });
    createdSubjects.push(sub);
  }

  const createdCseSubjects = createdSubjects.filter((s) => s.department === 'Computer Science and Engineering');
  const createdItSubjects = createdSubjects.filter((s) => s.department === 'Information Technology');

  console.log(`✅ Provisioned ${createdSubjects.length} Anna University subjects across all departments.`);

  // 3. Create Timetables & Entries
  const cseTimetable = await prisma.timetable.create({
    data: {
      department: 'Computer Science and Engineering',
      semester: 5,
      section: 'A',
      academicYear: '2025-2026',
    },
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const cseSem5Subs = createdCseSubjects.filter((s) => s.semester === 5);

  for (let i = 0; i < 5; i++) {
    const day = days[i];
    await prisma.timetableEntry.create({
      data: {
        timetableId: cseTimetable.id,
        entryType: 'LECTURE',
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '10:00',
        room: 'CS-Hall-302',
        subjectId: cseSem5Subs[i % cseSem5Subs.length].id,
      },
    });

    await prisma.timetableEntry.create({
      data: {
        timetableId: cseTimetable.id,
        entryType: 'LECTURE',
        dayOfWeek: day,
        startTime: '10:15',
        endTime: '11:15',
        room: 'CS-Hall-302',
        subjectId: cseSem5Subs[(i + 1) % cseSem5Subs.length].id,
      },
    });
  }

  // Add upcoming Model Exams to timetable
  const examDates = [
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
  ];

  for (let i = 0; i < 3; i++) {
    await prisma.timetableEntry.create({
      data: {
        timetableId: cseTimetable.id,
        entryType: 'INTERNAL_ASSESSMENT',
        startTime: '09:30',
        endTime: '12:30',
        room: 'Exam Hall 1',
        subjectId: cseSem5Subs[i].id,
        examDate: examDates[i],
        description: `CAT-2 Examination for ${cseSem5Subs[i].name}`,
      },
    });
  }

  // 4. Generate 60 Students with Diverse Profiles
  const studentNames = [
    // CSE Cohort (32 students)
    { name: 'Arjun Kumar', reg: '21CSR042', dept: 'Computer Science and Engineering', profile: 'CRITICAL' },
    { name: 'Rohit Verma', reg: '21CSR089', dept: 'Computer Science and Engineering', profile: 'SAFE_HIGH' },
    { name: 'Sneha Patel', reg: '21CSR015', dept: 'Computer Science and Engineering', profile: 'WATCH' },
    { name: 'Karthik Raja', reg: '21CSR033', dept: 'Computer Science and Engineering', profile: 'SAFE' },
    { name: 'Divya Bharathi', reg: '21CSR027', dept: 'Computer Science and Engineering', profile: 'WATCH' },
    { name: 'Vigneshwaran M', reg: '21CSR094', dept: 'Computer Science and Engineering', profile: 'CRITICAL' },
    { name: 'Ananya Roy', reg: '21CSR008', dept: 'Computer Science and Engineering', profile: 'SAFE_HIGH' },
    { name: 'Siddharth Rao', reg: '21CSR081', dept: 'Computer Science and Engineering', profile: 'SAFE' },
    { name: 'Meera Krishnan', reg: '21CSR052', dept: 'Computer Science and Engineering', profile: 'WATCH' },
    { name: 'Manoj Kumar S', reg: '21CSR048', dept: 'Computer Science and Engineering', profile: 'CRITICAL' },
    { name: 'Pooja Sundaram', reg: '21CSR067', dept: 'Computer Science and Engineering', profile: 'SAFE' },
    { name: 'Harish Babu', reg: '21CSR038', dept: 'Computer Science and Engineering', profile: 'WATCH' },
    { name: 'Keerthana R', reg: '21CSR045', dept: 'Computer Science and Engineering', profile: 'SAFE' },
    { name: 'Naveen Prasath', reg: '21CSR060', dept: 'Computer Science and Engineering', profile: 'CRITICAL' },
    { name: 'Aakash Nair', reg: '21CSR002', dept: 'Computer Science and Engineering', profile: 'SAFE_HIGH' },
    { name: 'Gowtham V', reg: '21CSR035', dept: 'Computer Science and Engineering', profile: 'WATCH' },
    { name: 'Pavithra Devi', reg: '21CSR063', dept: 'Computer Science and Engineering', profile: 'SAFE' },
    { name: 'Deepak Raj', reg: '21CSR022', dept: 'Computer Science and Engineering', profile: 'SAFE' },
    { name: 'Swetha Venkat', reg: '21CSR091', dept: 'Computer Science and Engineering', profile: 'WATCH' },
    { name: 'Kavitha M', reg: '21CSR044', dept: 'Computer Science and Engineering', profile: 'SAFE' },
    { name: 'Sanjay Dutt', reg: '21CSR079', dept: 'Computer Science and Engineering', profile: 'WATCH' },
    { name: 'Archana S', reg: '21CSR010', dept: 'Computer Science and Engineering', profile: 'SAFE_HIGH' },
    { name: 'Rahul Bose', reg: '21CSR072', dept: 'Computer Science and Engineering', profile: 'SAFE' },
    { name: 'Preeti Shenoy', reg: '21CSR069', dept: 'Computer Science and Engineering', profile: 'SAFE' },
    { name: 'Ashwin Kumar', reg: '21CSR012', dept: 'Computer Science and Engineering', profile: 'CRITICAL' },
    { name: 'Deepika S', reg: '21CSR024', dept: 'Computer Science and Engineering', profile: 'SAFE' },
    { name: 'Girish Karnad', reg: '21CSR034', dept: 'Computer Science and Engineering', profile: 'SAFE' },
    { name: 'Bhavani Shankar', reg: '21CSR018', dept: 'Computer Science and Engineering', profile: 'WATCH' },
    { name: 'Monika Rao', reg: '21CSR055', dept: 'Computer Science and Engineering', profile: 'SAFE' },
    { name: 'Suresh Raina', reg: '21CSR090', dept: 'Computer Science and Engineering', profile: 'WATCH' },
    { name: 'Varun Tej', reg: '21CSR093', dept: 'Computer Science and Engineering', profile: 'CRITICAL' },
    { name: 'Yamini Sharma', reg: '21CSR099', dept: 'Computer Science and Engineering', profile: 'SAFE' },

    // IT Cohort (28 students)
    { name: 'Priya Nair', reg: '21ITR018', dept: 'Information Technology', profile: 'WATCH' },
    { name: 'Rohan Gupta', reg: '21ITR024', dept: 'Information Technology', profile: 'SAFE_HIGH' },
    { name: 'Abhishek Sen', reg: '21ITR001', dept: 'Information Technology', profile: 'CRITICAL' },
    { name: 'Nandhini K', reg: '21ITR015', dept: 'Information Technology', profile: 'SAFE' },
    { name: 'Vikram Seth', reg: '21ITR029', dept: 'Information Technology', profile: 'WATCH' },
    { name: 'Tanvi Madan', reg: '21ITR027', dept: 'Information Technology', profile: 'SAFE_HIGH' },
    { name: 'Kishore Kumar', reg: '21ITR012', dept: 'Information Technology', profile: 'CRITICAL' },
    { name: 'Shreya Ghoshal', reg: '21ITR026', dept: 'Information Technology', profile: 'SAFE' },
    { name: 'Gautam Gambhir', reg: '21ITR009', dept: 'Information Technology', profile: 'WATCH' },
    { name: 'Bhuvaneshwari P', reg: '21ITR005', dept: 'Information Technology', profile: 'SAFE' },
    { name: 'Dinesh Karthik', reg: '21ITR007', dept: 'Information Technology', profile: 'CRITICAL' },
    { name: 'Lavanya Chandran', reg: '21ITR014', dept: 'Information Technology', profile: 'SAFE' },
    { name: 'Pradeep R', reg: '21ITR017', dept: 'Information Technology', profile: 'WATCH' },
    { name: 'Naveen Ul Haq', reg: '21ITR016', dept: 'Information Technology', profile: 'SAFE' },
    { name: 'Ishwarya R', reg: '21ITR011', dept: 'Information Technology', profile: 'SAFE_HIGH' },
    { name: 'Ajay Jadeja', reg: '21ITR002', dept: 'Information Technology', profile: 'CRITICAL' },
    { name: 'Gayathri Menon', reg: '21ITR008', dept: 'Information Technology', profile: 'WATCH' },
    { name: 'Vimal Kumar', reg: '21ITR030', dept: 'Information Technology', profile: 'SAFE' },
    { name: 'Anuradha Paudwal', reg: '21ITR004', dept: 'Information Technology', profile: 'SAFE' },
    { name: 'Jitendra Singh', reg: '21ITR010', dept: 'Information Technology', profile: 'WATCH' },
    { name: 'Manish Pandey', reg: '21ITR013', dept: 'Information Technology', profile: 'CRITICAL' },
    { name: 'Rajeshwari S', reg: '21ITR020', dept: 'Information Technology', profile: 'SAFE' },
    { name: 'Rohit Sharma IT', reg: '21ITR023', dept: 'Information Technology', profile: 'SAFE_HIGH' },
    { name: 'Ritu Varma', reg: '21ITR022', dept: 'Information Technology', profile: 'SAFE' },
    { name: 'Surya Kumar', reg: '21ITR025', dept: 'Information Technology', profile: 'WATCH' },
    { name: 'Tarun Mansukhani', reg: '21ITR028', dept: 'Information Technology', profile: 'SAFE' },
    { name: 'Bimal Roy', reg: '21ITR006', dept: 'Information Technology', profile: 'WATCH' },
    { name: 'Anand Kumar', reg: '21ITR003', dept: 'Information Technology', profile: 'SAFE' },
  ];

  console.log(`Generating records for ${studentNames.length} students...`);

  for (const sData of studentNames) {
    const isCse = sData.dept === 'Computer Science and Engineering';
    const advisorId = isCse ? teacherUser1.teacherProfile!.id : teacherUser2.teacherProfile!.id;
    const currentSubs = isCse ? createdCseSubjects.filter((s) => s.semester === 5) : createdItSubjects.filter((s) => s.semester === 5);
    const prevSubs = isCse ? createdCseSubjects.filter((s) => s.semester < 5) : createdItSubjects.filter((s) => s.semester < 5);

    const email = `${sData.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@student.scris.edu`;

    const user = await prisma.user.create({
      data: {
        name: sData.name,
        email,
        passwordHash: studentPasswordHash,
        role: 'STUDENT',
        department: sData.dept,
        studentProfile: {
          create: {
            registerNumber: sData.reg,
            degree: isCse ? 'B.Tech Computer Science and Engineering' : 'B.Tech Information Technology',
            batchYear: 2023,
            currentSemester: 5,
            section: 'A',
            advisorId,
            phone: '+91 98401 23456',
          },
        },
      },
      include: { studentProfile: true },
    });

    const student = user.studentProfile!;

    // 4.1 Enroll in current semester subjects
    for (const sub of currentSubs) {
      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          subjectId: sub.id,
          semester: 5,
          status: 'ACTIVE',
        },
      });
    }

    // 4.2 Populate Attendance Records for Semester 5
    for (const sub of currentSubs) {
      let attended = 48;
      const total = 50;

      if (sData.profile === 'CRITICAL') {
        attended = Math.floor(Math.random() * 10) + 28; // 56% to 74%
      } else if (sData.profile === 'WATCH') {
        attended = Math.floor(Math.random() * 6) + 36; // 72% to 84%
      } else if (sData.profile === 'SAFE_HIGH') {
        attended = Math.floor(Math.random() * 4) + 46; // 92% to 100%
      } else {
        attended = Math.floor(Math.random() * 8) + 40; // 80% to 96%
      }

      const pct = Number(((attended / total) * 100).toFixed(1));

      await prisma.attendanceRecord.create({
        data: {
          studentId: student.id,
          subjectId: sub.id,
          semester: 5,
          attendedClasses: attended,
          totalClasses: total,
          percentage: pct,
        },
      });
    }

    // 4.3 Populate Internal Assessments (CAT-1 and Assignment)
    for (const sub of currentSubs) {
      let cat1Score = 38;
      let assignScore = 18;

      if (sData.profile === 'CRITICAL') {
        cat1Score = Math.floor(Math.random() * 15) + 12; // 12-27 out of 50 (Fail or borderline)
        assignScore = Math.floor(Math.random() * 8) + 8; // 8-16 out of 20
      } else if (sData.profile === 'WATCH') {
        cat1Score = Math.floor(Math.random() * 10) + 26; // 26-36 out of 50
        assignScore = Math.floor(Math.random() * 4) + 14;
      } else if (sData.profile === 'SAFE_HIGH') {
        cat1Score = Math.floor(Math.random() * 5) + 44; // 44-49 out of 50
        assignScore = Math.floor(Math.random() * 2) + 18;
      } else {
        cat1Score = Math.floor(Math.random() * 8) + 34; // 34-42 out of 50
        assignScore = Math.floor(Math.random() * 4) + 16;
      }

      await prisma.internalAssessment.create({
        data: {
          studentId: student.id,
          subjectId: sub.id,
          assessmentType: 'CAT-1',
          score: cat1Score,
          maxScore: 50,
          assessmentDate: new Date('2026-08-25'),
        },
      });

      await prisma.internalAssessment.create({
        data: {
          studentId: student.id,
          subjectId: sub.id,
          assessmentType: 'Assignment',
          score: assignScore,
          maxScore: 20,
          assessmentDate: new Date('2026-09-15'),
        },
      });
    }

    // 4.4 Populate Previous Semester Results (Semesters 1 - 4)
    for (const pSub of prevSubs) {
      let grade = 'A';
      let gradePoint = 8;
      let status = 'PASS';

      if (sData.profile === 'CRITICAL') {
        // High failure likelihood
        const roll = Math.random();
        if (roll < 0.4) {
          grade = 'RA';
          gradePoint = 0;
          status = 'FAIL';
        } else if (roll < 0.7) {
          grade = 'C';
          gradePoint = 5;
        } else {
          grade = 'B';
          gradePoint = 6;
        }
      } else if (sData.profile === 'WATCH') {
        const roll = Math.random();
        if (roll < 0.2) {
          grade = 'RA';
          gradePoint = 0;
          status = 'FAIL';
        } else if (roll < 0.6) {
          grade = 'B';
          gradePoint = 6;
        } else {
          grade = 'B+';
          gradePoint = 7;
        }
      } else if (sData.profile === 'SAFE_HIGH') {
        grade = Math.random() > 0.4 ? 'O' : 'A+';
        gradePoint = grade === 'O' ? 10 : 9;
      } else {
        grade = Math.random() > 0.5 ? 'A' : 'B+';
        gradePoint = grade === 'A' ? 8 : 7;
      }

      await prisma.semesterResult.create({
        data: {
          studentId: student.id,
          subjectId: pSub.id,
          semester: pSub.semester,
          grade,
          gradePoint,
          credits: pSub.credits,
          status,
          attemptNumber: 1,
        },
      });

      // If failed, create corresponding Arrear record
      if (status === 'FAIL') {
        await prisma.arrear.create({
          data: {
            studentId: student.id,
            subjectId: pSub.id,
            originalSemester: pSub.semester,
            attempts: 1,
            deadlineSemester: pSub.semester + 4,
            status: 'PENDING',
          },
        });
      }
    }

    // 4.5 Interventions for CRITICAL or WATCH students
    if (sData.profile === 'CRITICAL') {
      await prisma.intervention.create({
        data: {
          studentId: student.id,
          staffId: advisorId,
          type: 'Academic Counselling',
          notes: 'Student exhibits multiple arrears and sub-50% CAT scores. Advised remedial study schedule.',
          followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'OPEN',
        },
      });

      // In-app notifications
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'RISK_CHANGE',
          title: 'Academic Alert: Critical Risk Identified',
          message: 'Your academic indicators show high risk due to pending arrears and attendance. Please consult your faculty advisor.',
        },
      });
    } else {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'EXAM_SCHEDULE',
          title: 'CAT-2 Schedule Published',
          message: 'The internal assessment timetable for Semester 5 is now published in your timetable view.',
        },
      });
    }
  // Setup predefined administrator accounts (admin@gmail.com & admint@gmail.com)
  await setupPredefinedUsers();

  console.log('🎉 Database seeding completed successfully with ~60 students across 2 departments.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
