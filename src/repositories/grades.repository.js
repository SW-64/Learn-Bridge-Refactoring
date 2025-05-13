import { prisma } from '../utils/prisma.utils.js';

class GradesRepository {
  // 성적 입력
  createGrades = async (gradesWithStudentId, studentUserId) => {
    const data = await prisma.grade.createMany({
      data: gradesWithStudentId,
    });

    const schoolYear = gradesWithStudentId[0].schoolYear;
    const semester = gradesWithStudentId[0].semester;

    const notification = await prisma.notification.create({
      data: {
        userId: studentUserId,
        type: 'GRADE',
        message: `${schoolYear}학년 ${semester}학기 생성`,
      },
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
  updateGrades = async (gradesWithStudentId, studentUserId) => {
    await prisma.$transaction(async (tx) => {
      const results = await Promise.all(
        gradesWithStudentId.map((grade) =>
          tx.grade.updateMany({
            where: {
              studentId: grade.studentId,
              schoolYear: grade.schoolYear,
              semester: grade.semester,
              subject: grade.subject,
              updatedAt: grade.updatedAt, // 낙관적 락용
            },
            data: {
              scoreIv: grade.scoreIv,
              scoreContent: grade.scoreContent,
              updatedAt: new Date(),
            },
          }),
        ),
      );

      //  하나라도 수정되지 않았다면 트랜잭션 전체 취소
      const failed = results.find((res) => res.count === 0);
      if (failed) {
        throw new Error('다른 탭 혹은 창에서 이미 수정되었습니다.');
      }
    });
    const schoolYear = gradesWithStudentId[0].schoolYear;
    const semester = gradesWithStudentId[0].semester;
    const notification = await prisma.notification.create({
      data: {
        userId: studentUserId,
        type: 'GRADE',
        message: `${schoolYear}학년 ${semester}학기 업데이트`,
      },
    });

    return;
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
        scoreIv: true,
        scoreContent: true,
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
