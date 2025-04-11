import { ConflictError } from '../errors/http.error.js';
import { MESSAGES } from '../constants/message.constant.js';
import UserRepository from '../repositories/user.repository.js';

class UserService {
  userRepository = new UserRepository();

  // 담임 설정 및 반 생성
  assignHomeRoom = async (grade, gradeClass,teacherId) => {
    // 반에 담임이 이미 존재한다면 에러 반환
    const existedClass = await this.userRepository.findClass(grade,gradeClass);
    if (existedClass) {
      throw new ConflictError("이미 담임이 존재하는 반입니다.");
    }

    const data = await this.userRepository.createClass(grade,gradeClass,teacherId);
    return data;
  };
}

export default UserService;
