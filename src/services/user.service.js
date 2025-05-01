import { ConflictError, UnauthorizedError } from '../errors/http.error.js';
import { MESSAGES } from '../constants/message.constant.js';
import { NotFoundError } from '../errors/http.error.js';
import UserRepository from '../repositories/user.repository.js';
import TeacherRepository from '../repositories/teacher.repository.js';
import bcrypt from 'bcrypt';
import SchoolRepository from '../repositories/school.repository.js';
import ClassRepository from '../repositories/class.repository.js';
class UserService {
  userRepository = new UserRepository();
  teacherRepository = new TeacherRepository();
  schoolRepository = new SchoolRepository();
  classRepository = new ClassRepository();
  // 담임 설정 및 반 생성
  assignHomeRoom = async (grade, gradeClass, userId, schoolId) => {
    // 반에 담임이 이미 존재한다면, 교체
    const existedClass = await this.classRepository.findClassByGradeAndClass(
      grade,
      gradeClass,
      schoolId,
    );
    // 유저 id로 선생 id를 가져오기
    const teacher = await this.teacherRepository.findTeacherByUserId(userId);
    const teacherId = teacher.teacherId;

    if (existedClass) {
      const originalTeacherId = existedClass.teacherId;
      const data = await this.classRepository.updateHomeroom(
        existedClass.classId,
        originalTeacherId,
        teacherId,
      );
      return data;
    }

    const setHomeroom = await this.teacherRepository.setHomeroom(teacherId);
    const data = await this.classRepository.createClass(
      grade,
      gradeClass,
      teacherId,
    );
    return data;
  };
  // 내 정보 조회
  getMyInfo = async (userId, userRole) => {
    const user = await this.userRepository.getUserById(userId, userRole);
    if (!user) throw new Error('유저를 찾을 수 없습니다.');
    return user;
  };

  // 내 비밀번호 수정
  updateMyPassword = async (userId, currentPassword, newPassword) => {
    const user = await this.userRepository.getUserPassword(userId);
    if (!user) throw new NotFoundError('유저를 찾을 수 없습니다.');

    const passwordCheck = bcrypt.compareSync(currentPassword, user.password);
    if (!passwordCheck) {
      throw new UnauthorizedError(MESSAGES.AUTH.COMMON.UNAUTHORIZED);
    }
    const updatedUser = await this.userRepository.updateMyPassword(
      userId,
      newPassword,
    );
    if (!updatedUser) throw new Error('유저를 찾을 수 없습니다.');
    return;
  };

  // 내 정보 수정
  updateMyInfo = async (userId, name, schoolName, profile) => {
    const user = await this.userRepository.getUserById(userId);
    if (!user) throw new NotFoundError('유저를 찾을 수 없습니다.');
    const school = schoolName
      ? await this.schoolRepository.findSchoolBySchoolName(schoolName)
      : null;

    const updatedUser = await this.userRepository.updateMyInfo(
      userId,
      name,
      profile,
      school ? school[0].schoolId : null,
    );
    return updatedUser;
  };
}

export default UserService;
