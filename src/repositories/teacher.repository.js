import { prisma } from '../utils/prisma.utils.js';

class TeacherRepository {
  // 선생님 조회
  findTeacherByUserId = async (userId) => {
    const data = await prisma.teacher.findUnique({
      where: {
        userId,
      },
      include: {
        user: true,
      },
    });
    return data;
  };

  // 담임 설정
  setHomeroom = async (teacherId) => {
    const data = await prisma.teacher.update({
      where: {
        teacherId,
      },
      data: {
        isHomeroom: true,
      },
    });
    return data;
  };

  // 추가 가능한 교사 조회 (isHomeroom = false)
  getAvailableTeachers = async (schoolId) => {
    const data = await prisma.teacher.findMany({
      where: {
        isHomeroom: false,
        user: {
          schoolId,
        },
      },
      select: {
        teacherId: true,
        subject: true,
        user: {
          select: {
            name: true,
            loginId: true,
            email: true,
          },
        },
      },
    });
    return data;
  };
}

export default TeacherRepository;
