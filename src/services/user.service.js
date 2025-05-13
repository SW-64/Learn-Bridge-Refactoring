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

  // 인증 코드 확인
  findMyPassword = async (email, code) => {
    const redisCode = await redis.get(email);
    if (!redisCode) {
      throw new ConflictError('인증 코드가 만료되었습니다.');
    }
    if (code !== redisCode) {
      throw new ConflictError('인증 코드가 일치하지 않습니다.');
    }
    await redis.del(`email`);
    await redis.set(`reset-ok:${email}`, 'true', 'EX', 300);
    return;
  };
  // 인증 코드 발송
  sendFindMyPasswordCode = async (email) => {
    const code = getRandomCode();
    console.log(code);
    await redis.set(email, code, 'EX', 300); // 5분 유효기간
    console.log(await redis.get(email));
    sendEmail(
      email,
      '[인증 코드 알림]',
      `인증코드 : ${code} 입니다. 5분 안에 입력해주세요.`,
    ).catch((err) => {
      console.error('이메일 전송 실패:', err);
    });

    return;
  };

  // 새 비밀번호 설정
  setNewPassword = async (email, newPassword, newPasswordVerified, userId) => {
    const verified = await redis.get(`reset-ok:${email}`);
    if (verified !== 'true') throw new Error('인증되지 않은 사용자입니다.');
    if (newPassword !== newPasswordVerified) {
      throw new ConflictError('비밀번호가 일치하지 않습니다.');
    }

    const updatedUser = await this.userRepository.updateMyPassword(
      userId,
      newPassword,
    );
    await redis.del(`reset-ok:${email}`);
    return;
  };
}

export default UserService;
