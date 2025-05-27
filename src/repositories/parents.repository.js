import { prisma } from '../utils/prisma.utils.js';
import bcrypt from 'bcrypt';
import { authConstant } from '../constants/auth.constant.js';

class ParentsRepository {
  // 학부모 회원가입
  createParents = async ({ loginId, schoolId, rawPassword }) => {
    //비밀번호 암호화처리
    const hashedPassword = bcrypt.hashSync(
      rawPassword,
      authConstant.HASH_SALT_ROUNDS,
    );
    const loginIdStr = String(loginId);

    const data = await prisma.user.create({
      data: {
        loginId: `${loginIdStr}p`,
        password: hashedPassword,
        role: 'PARENT',
        Parents: {
          create: {},
        },
        schoolId,
      },
      include: {
        Parents: true,
      },
    });
    return data;
  };

  // 유저 ID로 학부모 찾기
  getParentsByUserId = async (userId) => {
    const parent = await prisma.parents.findUnique({
      where: {
        userId: userId,
      },
    });
    return parent;
  };
}

export default ParentsRepository;
