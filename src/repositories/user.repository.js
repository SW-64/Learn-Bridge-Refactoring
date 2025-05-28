import { authConstant } from '../constants/auth.constant.js';
import { prisma } from '../utils/prisma.utils.js';
import bcrypt from 'bcrypt';
class UserRepository {
  // 반 or 담임 조회 (유효성 검증)
  findClass = async (grade, gradeClass) => {
    const data = await prisma.class.findFirst({
      where: {
        grade: grade,
        gradeClass: gradeClass,
      },
    });
    return data;
  };

  // 내 정보 조회
  getUserById = async (userId, userRole) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        role: true,
        ...(userRole === 'TEACHER' && {
          teacher: {
            select: {
              isHomeroom: true,
              subject: true,
              class: {
                select: {
                  grade: true,
                  gradeClass: true,
                },
              },
            },
          },
        }),
        ...(userRole === 'STUDENT' && {
          student: {
            select: {
              studentId: true,
              grade: true,
              gradeClass: true,
              number: true,
            },
          },
        }),
        ...(userRole === 'PARENT' && {
          Parents: {
            select: {
              parentsId: true,
              Student: {
                select: {
                  studentId: true,
                },
              },
            },
          },
        }),
        school: {
          select: {
            schoolName: true,
          },
        },
      },
    });
    return user;
  };

  // 내 비밀번호 조회
  getUserPassword = async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        password: true,
      },
    });
    return user;
  };

  // 내 비밀번호 수정
  updateMyPassword = async (userId, password) => {
    const hashedPassword = bcrypt.hashSync(
      password,
      authConstant.HASH_SALT_ROUNDS,
    );
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });
    user.password = undefined;
    return user;
  };

  // 내 정보 수정
  updateMyInfo = async (userId, profile) => {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(profile && { photo: profile }),
      },
    });
    return user;
  };

  // 이메일로 유저 조회
  getUserByEmail = async (email) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  };
}
export default UserRepository;
