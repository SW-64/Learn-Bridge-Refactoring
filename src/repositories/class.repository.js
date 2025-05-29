import { prisma } from '../utils/prisma.utils.js';

class ClassRepository {
  // 반 조회
  findClassByClassId = async (classId) => {
    const data = await prisma.class.findUnique({
      where: {
        classId,
      },
      include: {
        teacher: {
          select: {
            teacherId: true,
            subject: true,
            isHomeroom: true,
            user: {
              select: {
                name: true,
                loginId: true,
                email: true,
              },
            },
          },
        },
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

  getAllClasses = async (schoolId) => {
    const data = await prisma.class.findMany({
      where: {
        schoolId,
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

  // // 반 생성
  // createClass = async (grade, gradeClass, teacherId) => {
  //   const data = await prisma.class.create({
  //     data: {
  //       grade,
  //       gradeClass,
  //       //반 테이블과 교사 테이블을 연결
  //       teacherId,
  //     },
  //   });
  //   return data;
  // };

  // 반 일괄 생성
  createClass = async (classList) => {
    const data = await prisma.class.createMany({
      data: classList,
    });
    return data;
  };

  // 학생들 반에 배정
  assignStudentsToClass = async (tx, classId, addedStudentIds) => {
    // 반 정보 가져오기
    const targetClass = await tx.class.findUnique({
      where: { classId },
      select: {
        grade: true,
        gradeClass: true,
      },
    });

    await tx.student.updateMany({
      where: { studentId: { in: addedStudentIds } },
      data: {
        classId,
        grade: targetClass.grade,
        gradeClass: targetClass.gradeClass,
      },
    });
  };

  // 반에서 학생 제거
  removeStudentsFromClass = async (tx, classId, removedStudentIds) => {
    await tx.student.updateMany({
      where: {
        studentId: { in: removedStudentIds },
        classId,
      },
      data: {
        classId: null,
        grade: null,
        gradeClass: null,
      },
    });
  };

  // 기존 담임 비활성화
  resetHomeroomTeacher = async (tx, classId) => {
    await tx.teacher.updateMany({
      where: {
        isHomeroom: true,
        class: { classId },
      },
      data: { isHomeroom: false },
    });
  };

  // 새 담임 배정 + class 테이블 갱신
  setNewHomeroomTeacher = async (tx, classId, teacherId) => {
    await tx.teacher.update({
      where: { teacherId },
      data: { isHomeroom: true },
    });

    await tx.class.update({
      where: { classId },
      data: {
        teacher: {
          connect: { teacherId },
        },
      },
    });
  };
}

export default ClassRepository;
