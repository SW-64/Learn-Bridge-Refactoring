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
}

export default TeacherRepository;
