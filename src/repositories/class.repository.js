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

  findClassByTeacherId = async (teacherId) => {
    const data = await prisma.class.findFirst({
      where: {
        teacherId,
      },
    });
    return data;
  };

  findClassByGradeAndClass = async (grade, gradeClass, schoolId) => {
    const data = await prisma.class.findFirst({
      where: {
        grade,
        gradeClass,
        teacher: {
          is: {
            user: {
              schoolId,
            },
          },
        },
      },
    });
    return data;
  };

  // 담임 변경

  updateHomeroom = async (classId, originalTeacherId, newTeacherId) => {
    const data = await prisma.class.update({
      where: {
        classId,
      },
      data: {
        teacherId: newTeacherId,
      },
    });

    const originalTeacher = await prisma.teacher.update({
      where: {
        teacherId: originalTeacherId,
      },
      data: {
        isHomeroom: false,
      },
    });

    const newTeacher = await prisma.teacher.update({
      where: {
        teacherId: newTeacherId,
      },
      data: {
        isHomeroom: true,
      },
    });

    return data;
  };

  // 반 생성
  createClass = async (grade, gradeClass, teacherId) => {
    const data = await prisma.class.create({
      data: {
        grade,
        gradeClass,
        //반 테이블과 교사 테이블을 연결
        teacherId,
      },
    });
    return data;
  };
}

export default ClassRepository;
