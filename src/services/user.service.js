import UserRepository from '../repositories/user.repository.js';

class UserService {
  userRepository = new UserRepository();

  // 담임 설정 및 반 생성
  assignHomeRoom = async (grade, gradeClass) => {};
}

export default UserService;
