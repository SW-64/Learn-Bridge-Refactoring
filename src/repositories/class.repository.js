import { prisma } from '../utils/prisma.utils.js';

class ClassRepository {
  // 반 조회
  findClassByClassId = async (classId) => {
    const data = await prisma.class.findUnique({
      where: {
        classId,
      },
    });
    return data;
  };
}

export default ClassRepository;
