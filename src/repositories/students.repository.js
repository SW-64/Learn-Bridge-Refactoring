import { prisma } from '../utils/prisma.utils.js';

class StudentsRepository {
  //반 학생 목록 조회
  getClassStudent = async (classId, schoolId) => {
    const students = await prisma.student.findMany({
      where: {
        classId,
        user: {
          schoolId,
        },
      },
      select: {
        studentId: true,
        grade: true,
        number: true,
        gradeClass: true,
        user: {
          select: {
            name: true,
            schoolId: true,
          },
        },
      },
    });
    return students;
  };

  //특정 학생 상세 조회
  getOneStudent = async (studentId) => {
    console.log(studentId);
    const student = await prisma.student.findUnique({
      where: {
        studentId: studentId,
      },
      select: {
        studentId: true,
        grade: true,
        number: true,
        gradeClass: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            photo: true,
          },
        },
      },
    });
    return student;
  };

  //특정 학생 정보 수정
  updateOneStudent = async (studentId, name, grade, gradeClass, number) => {
    const student = await prisma.student.update({
      where: {
        studentId: studentId,
      },

      data: {
        ...(name && { name: name }),
        ...(grade && { grade: grade }),
        ...(gradeClass && { gradeClass: gradeClass }),
        ...(number && { number: number }),
      },
    });
    return student;
  };

  //특정 학생 정보 삭제
  deleteOneStudent = async (studentId) => {
    const student = await prisma.student.delete({
      where: {
        studentId: studentId,
      },
    });
    return student;
  };

  // 특정 학생 정보 검색
  searchStudent = async (name, schoolId) => {
    const student = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        name: {
          contains: name,
        },
        schoolId,
      },
      select: {
        name: true,
        email: true,
        student: {
          select: {
            studentId: true,
            grade: true,
            number: true,
            gradeClass: true,
          },
        },
      },
      // include: {
      //   user: true,
      // },
    });
    student.password = undefined;

    return student;
  };

  // 해당 반 학생의 학생이 맞는지 조회
  verifiedStudentInCLass = async (studentId, classId) => {
    const student = await prisma.student.findFirst({
      where: {
        studentId,
        classId,
      },
      select: {
        grade: true,
      },
    });
    return student;
  };

  // 유저 ID로 학생 찾기
  getStudentByUserId = async (userId) => {
    const student = await prisma.student.findUnique({
      where: { userId },
      select: {
        studentId: true,
        grade: true,
        number: true,
        gradeClass: true,
        user: {
          select: {
            name: true,
            email: true,
            photo: true,
          },
        },
      },
    });
    return student;
  };
}

export default StudentsRepository;
