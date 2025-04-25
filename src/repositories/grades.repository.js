import { prisma } from '../utils/prisma.utils.js';

class GradesRepository {
  // 성적 입력
  createGrades = async (gradesWithStudentId) => {
    const data = await prisma.grade.createMany({
      data: gradesWithStudentId,
    });
    return data;
  };

  // 특정 과목에 대한 성적 조회
  getGradesBySubject = async (subject, studentId) => {
    const data = await prisma.grade.findMany({
      where: {
        subject,
        studentId,
      },
    });
    return data;
  };

  // 특정 기간에 대한 성적 조회
  getGradesByPeriod = async (schoolYear, semester, studentId) => {
    const data = await prisma.grade.findMany({
      where: {
        schoolYear,
        semester,
        studentId,
      },
    });
    return data;
  };

  // 성적 수정
  updateGrades = async (gradesWithStudentId) => {
    const grades = gradesWithStudentId.map((grade) =>
      prisma.grade.updateMany({
        where: {
          studentId: grade.studentId,
          schoolYear: grade.schoolYear,
          semester: grade.semester,
          subject: grade.subject,
        },
        data: {
          score: grade.score,
        },
      }),
    );
    const results = await Promise.all(grades);
    return results;
  };

  // 특정 기간에 맞는 특정 과목 성적 조회
  getGradesByPeriodAndSubject = async (
    subject,
    studentId,
    schoolYear,
    semester,
  ) => {
    const data = await prisma.grade.findFirst({
      where: {
        schoolYear,
        semester,
        subject,
        studentId,
      },
    });
    return data;
  };

  // 반 학생 성적 조회
  getClassGrades = async (classId, semester) => {
    const data = await prisma.grade.findMany({
      where: {
        semester,
        student: {
          classId,
        },
      },
      select: {
        subject: true,
        score: true,
        student: {
          select: {
            studentId: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    return data;
  };
}

export default GradesRepository;
