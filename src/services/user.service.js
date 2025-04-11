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
}

export default UserService;
