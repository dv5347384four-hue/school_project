import { PrismaClient, RoleName, GradeValueType, AttendanceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const school = await prisma.school.upsert({
    where: { id: 'school-197' },
    update: {},
    create: { id: 'school-197', name: 'Школа №197', city: 'Минск' }
  });

  const pwd = await bcrypt.hash('Password123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@school197.by' },
    update: {},
    create: {
      schoolId: school.id,
      email: 'admin@school197.by',
      passwordHash: pwd,
      firstName: 'Админ',
      lastName: 'Школы',
      role: RoleName.ADMIN,
      isEmailVerified: true
    }
  });

  const cls = await prisma.class.upsert({
    where: { id: 'class-9a' },
    update: {},
    create: { id: 'class-9a', schoolId: school.id, name: '9А', shift: 'morning' }
  });

  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher.math@school197.by' },
    update: {},
    create: { schoolId: school.id, email: 'teacher.math@school197.by', passwordHash: pwd, firstName: 'Анна', lastName: 'Иванова', role: RoleName.TEACHER, isEmailVerified: true }
  });
  const teacher = await prisma.teacher.upsert({ where: { userId: teacherUser.id }, update: {}, create: { userId: teacherUser.id } });
  const subject = await prisma.subject.create({ data: { schoolId: school.id, teacherId: teacher.id, name: 'Математика' } }).catch(() => prisma.subject.findFirstOrThrow({ where: { name: 'Математика' } }));
  const gradeType = await prisma.gradeType.create({ data: { subjectId: subject.id, type: GradeValueType.CURRENT, weight: 1 } }).catch(() => prisma.gradeType.findFirstOrThrow({ where: { subjectId: subject.id } }));

  for (let i = 1; i <= 50; i++) {
    const studentUser = await prisma.user.upsert({
      where: { email: `student${i}@school197.by` },
      update: {},
      create: {
        schoolId: school.id,
        email: `student${i}@school197.by`,
        passwordHash: pwd,
        firstName: `Ученик${i}`,
        lastName: 'Тестовый',
        role: RoleName.STUDENT,
        isEmailVerified: true
      }
    });
    const student = await prisma.student.upsert({ where: { userId: studentUser.id }, update: {}, create: { userId: studentUser.id, classId: cls.id, admissionDate: new Date() } });
    await prisma.enrollment.upsert({ where: { subjectId_studentId: { subjectId: subject.id, studentId: student.id } }, update: {}, create: { classId: cls.id, subjectId: subject.id, studentId: student.id } });
    await prisma.grade.create({ data: { studentId: student.id, subjectId: subject.id, gradeTypeId: gradeType.id, value: (i % 6) + 5, changedByUserId: admin.id, reason: 'seed data' } });
    await prisma.attendance.create({ data: { lessonId: (await prisma.lesson.findFirst({ where: { classId: cls.id } }))?.id || (await prisma.lesson.create({ data: { classId: cls.id, subjectId: subject.id, teacherId: teacher.id, weekday: 1, startsAt: '08:30', endsAt: '09:15' } })).id, studentId: student.id, status: AttendanceStatus.PRESENT, date: new Date() } });
  }

  console.log('Seed completed');
}

main().finally(() => prisma.$disconnect());
