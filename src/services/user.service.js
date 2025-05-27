import { ConflictError, UnauthorizedError } from '../errors/http.error.js';
import { MESSAGES } from '../constants/message.constant.js';
import { NotFoundError } from '../errors/http.error.js';
import UserRepository from '../repositories/user.repository.js';
import TeacherRepository from '../repositories/teacher.repository.js';
import bcrypt from 'bcrypt';
import SchoolRepository from '../repositories/school.repository.js';
import ClassRepository from '../repositories/class.repository.js';
import { getRandomCode } from '../utils/random-code.util.js';
import { sendEmail } from '../utils/send-email.util.js';
import redis from '../utils/redis.util.js';
import { prisma } from '../utils/prisma.utils.js';

class UserService {
  userRepository = new UserRepository();
  teacherRepository = new TeacherRepository();
  schoolRepository = new SchoolRepository();
  classRepository = new ClassRepository();
  // // 담임 설정 및 반 생성
  // assignHomeRoom = async (grade, gradeClass, userId, schoolId) => {
  //   // 반에 담임이 이미 존재한다면, 교체
  //   const existedClass = await this.classRepository.findClassByGradeAndClass(
  //     grade,
  //     gradeClass,
  //     schoolId,
  //   );
  //   // 유저 id로 선생 id를 가져오기
  //   const teacher = await this.teacherRepository.findTeacherByUserId(userId);
  //   const teacherId = teacher.teacherId;

  //   if (existedClass) {
  //     const originalTeacherId = existedClass.teacherId;
  //     const data = await this.classRepository.updateHomeroom(
  //       existedClass.classId,
  //       originalTeacherId,
  //       teacherId,
  //     );
  //     return data;
  //   }

  //   const setHomeroom = await this.teacherRepository.setHomeroom(teacherId);
  //   const data = await this.classRepository.createClass(
  //     grade,
  //     gradeClass,
  //     teacherId,
  //   );
  //   return data;
  // };

  // 반 생성 (반 초기화)
  createClasses = async ({ grade1, grade2, grade3 }) => {
    const allClassData = [];

    for (let grade = 1; grade <= 3; grade++) {
      const count = grade === 1 ? grade1 : grade === 2 ? grade2 : grade3;

      for (let i = 1; i <= count; i++) {
        allClassData.push({
          grade,
          gradeClass: i,
        });
      }
    }
    const data = await this.classRepository.createClass(allClassData);
    return data;
  };

  getClasses = async (schoolId) => {
    const data = await this.classRepository.getAllClasses(schoolId);
    return data;
  };

  // 교사 목록 조회
  getHomeroomInfo = async (classId, schoolId) => {
    const classData = await this.classRepository.findClassByClassId(classId);
    const noClassData =
      await this.teacherRepository.getAvailableTeachers(schoolId);
    const homeroom = classData?.teacher || null;
    const notHomeroom = noClassData || null;

    return {
      homeroom,
      notHomeroom,
    };
  };

  // 반 구성원 저장
  manageClassStudent = async ({
    classId,
    addedStudentIds,
    removedStudentIds,
  }) => {
    await prisma.$transaction(async (tx) => {
      // 학생 추가
      if (addedStudentIds?.length) {
        await this.classRepository.assignStudentsToClass(
          tx,
          classId,
          addedStudentIds,
        );
      }
      // 학생 제거
      if (removedStudentIds?.length) {
        await this.classRepository.removeStudentsFromClass(
          tx,
          classId,
          removedStudentIds,
        );
      }
    });
  };

  // 반 교사 저장
  manageClassTeacher = async ({ classId, newHomeroomTeacherId }) => {
    await prisma.$transaction(async (tx) => {
      // 기존 담임 해제
      await this.classRepository.resetHomeroomTeacher(tx, classId);
      // 새 담임 교사 연결
      if (newHomeroomTeacherId) {
        await this.classRepository.setNewHomeroomTeacher(
          tx,
          classId,
          newHomeroomTeacherId,
        );
      }
    });
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
  updateMyInfo = async (userId, profile) => {
    const user = await this.userRepository.getUserById(userId);
    if (!user) throw new NotFoundError('유저를 찾을 수 없습니다.');
    const updatedUser = await this.userRepository.updateMyInfo(userId, profile);
    return updatedUser;
  };
}
export default UserService;
