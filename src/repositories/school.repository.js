import { prisma } from '../utils/prisma.utils.js';
class SchoolRepository {
  // 학교 이름으로 학교 정보 조회
  findSchoolBySchoolName = async (schoolName) => {
    const data = await prisma.school.findUnique({
      where: {
        schoolName:schoolName,
      },
    });
    return data;
  };
}

export default SchoolRepository;
