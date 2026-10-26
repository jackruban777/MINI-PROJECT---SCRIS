import { PrismaClient } from '@prisma/client';
import { ANNA_UNIVERSITY_CURRICULUM } from '../config/annaUniversityCurriculum';

const prisma = new PrismaClient();

async function seedCurriculum() {
  console.log(`🏛️ Seeding ${ANNA_UNIVERSITY_CURRICULUM.length} Anna University R-2021 subjects...`);

  let addedCount = 0;
  let updatedCount = 0;

  for (const sub of ANNA_UNIVERSITY_CURRICULUM) {
    const existing = await prisma.subject.findFirst({
      where: {
        code: sub.code,
        department: sub.department,
      },
    });

    if (existing) {
      await prisma.subject.update({
        where: { id: existing.id },
        data: {
          name: sub.name,
          credits: sub.credits,
          semester: sub.semester,
        },
      });
      updatedCount++;
    } else {
      await prisma.subject.create({
        data: {
          code: sub.code,
          name: sub.name,
          credits: sub.credits,
          semester: sub.semester,
          department: sub.department,
        },
      });
      addedCount++;
    }
  }

  console.log(`✅ Finished seeding Anna University curriculum.`);
  console.log(`📊 Added: ${addedCount}, Updated: ${updatedCount}`);

  const total = await prisma.subject.count();
  console.log(`📚 Total Subjects in database: ${total}`);
}

seedCurriculum()
  .catch((e) => {
    console.error('Error seeding Anna University curriculum:', e);
  })
  .finally(() => prisma.$disconnect());
