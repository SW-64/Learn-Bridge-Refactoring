import { prisma } from '../utils/prisma.utils.js';

class StudentsRepository {
  //전체 학생 목록 조회
  getAllStudent = async () => {
    const students = await prisma.student.findMany({
      include: {
        user: true,
      },
    });
    return students;
  };

  //특정 학생 상세 조회
  getOneStudent = async (studentId) => {
    const student = await prisma.student.findUnique({
      where: {
        studentId: studentId,
      },

      include: {
        user: true,
      },
    });
    return student;
  };

  //특정 학생 정보 수정
  updateOneStudent = async (studentId, updateData) => {
    const student = await prisma.student.update({
      where: {
        studentId: studentId,
      },

      data: updateData,

      include: {
        user: true,
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
  searchStudent = async (name) => {
    const student = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        name: {
          contains: name,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        student: {
          select: {
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
}

export default StudentsRepository;
