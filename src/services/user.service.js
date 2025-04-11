import { NotFoundError } from '../errors/http.error.js';
import UserRepository from '../repositories/user.repository.js';

class UserService {
  userRepository = new UserRepository();

  // 담임 설정 및 반 생성
  assignHomeRoom = async (grade, gradeClass) => {};

  // 내 정보 조회
  getMyInfo = async (userId) => {
    const user = await this.userRepository.getUserById(userId);
    if (!user) throw new Error('유저를 찾을 수 없습니다.');
    return user;
  };

  // 내 비밀번호 수정
  updateMyPassword = async (userId, currentPassword, newPassword) => {
    const userPassword = await this.userRepository.getUserPassword(userId);
    if (!userPassword) throw new NotFoundError('유저를 찾을 수 없습니다.');

    const passwordCheck =
      user && bcrypt.compareSync(currentPassword, userPassword);
    if (!passwordCheck) {
      throw new UnauthorizedError(MESSAGES.AUTH.COMMON.UNAUTHORIZED);
    }
    const updatedUser = await this.userRepository.updateMyPassword(
      userId,
      newPassword,
    );
    if (!updatedUser) throw new Error('유저를 찾을 수 없습니다.');
    return updatedUser;
  };
}

export default UserService;
