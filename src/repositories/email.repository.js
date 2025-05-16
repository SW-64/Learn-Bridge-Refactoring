import { authConstant } from '../constants/auth.constant.js';
import { prisma } from '../utils/prisma.utils.js';
import bcrypt from 'bcrypt';
class EmailRepository {
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
}

export default EmailRepository;
