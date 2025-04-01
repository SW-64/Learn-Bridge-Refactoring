import { prisma } from '../utils/prisma.utils.js';

class GradesRepository {
  // 성적 입력
  createGrades = async (schoolYear, semester, subject, score, studentId) => {
    const data = await prisma.grade.create({
      data: {
        schoolYear,
        semester,
        subject,
        score,
        studentId,
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
  updateGrades = async (schoolYear, semester, subject, studentId, score) => {
    const data = await prisma.grade.update({
      where: {
        studentId,
        semester,
        schoolYear,
        subject,
      },
      data: score,
    });
    return data;
  };
}

export default GradesRepository;
