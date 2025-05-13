import { HTTP_STATUS } from '../constants/http-status.constant.js';
import UserService from '../services/user.service.js';

class UserController {
  userService = new UserService();

  // 담임 설정 및 반 생성
  // assignHomeRoom = async (req, res, next) => {
  //   try {
  //     const userId = req.user.id;
  //     const { schoolId } = req.params;
  //     const { grade, gradeClass } = req.body;

  //     const data = await this.userService.assignHomeRoom(
  //       grade,
  //       gradeClass,
  //       userId,
  //       +schoolId,
  //     );

  //     return res.status(HTTP_STATUS.OK).json({
  //       status: HTTP_STATUS.OK,
  //       message: '담임 설정 및 반 생성 성공',
  //       data,
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // };

  // 반 일괄 생성
  createClasses = async (req, res, next) => {
    try {
      const { grade1, grade2, grade3 } = req.body;
      const schoolId = req.user.schoolId;

      const data = await this.userService.createClasses({
        grade1,
        grade2,
        grade3,
        schoolId,
      });

      return res.status(201).json({
        status: 201,
        message: '반이 성공적으로 생성되었습니다.',
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  // 교사 목록 조회
  getTeachers = async (req, res, next) => {
    try {
      const { classId } = req.params;
      const schoolId = req.user.schoolId; // 어드민 유저의 학교ID

      const data = await this.userService.getHomeroomInfo(+classId, schoolId);

      return res.status(200).json({
        status: 200,
        message: '교사 조회 성공',
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  // 반 구성원 저장
  manageClassStudent = async (req, res, next) => {
    try {
      const { classId } = req.params;
      const { addedStudentIds, removedStudentIds } = req.body;

      const data = await this.userService.manageClassStudent({
        classId: +classId,
        addedStudentIds,
        removedStudentIds,
      });

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '반 관리 저장 완료',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // 반 교사 저장
  manageClassTeacher = async (req, res, next) => {
    try {
      const { classId } = req.params;
      const { newHomeroomTeacherId } = req.body;

      const data = await this.userService.manageClassTeacher({
        classId: +classId,
        newHomeroomTeacherId,
      });

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '반 관리 저장 완료',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // 내 정보 조회
  getMyInfo = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const data = await this.userService.getMyInfo(userId, userRole);

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '내 정보 조회 성공',
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  // 내 비밀번호 수정
  updateMyPassword = async (req, res, next) => {
    try {
      const userId = req.user.id;

      const { currentPassword, newPassword } = req.body;

      const data = await this.userService.updateMyPassword(
        userId,
        currentPassword,
        newPassword,
      );

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '내 비밀번호 수정 성공',
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  // 내 정보 수정
  updateMyInfo = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { name, schoolName, profile } = req.body;

      const data = await this.userService.updateMyInfo(
        userId,
        name,
        schoolName,
        profile,
      );

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '내 정보 수정 성공',
        data,
      });
    } catch (err) {
      next(err);
    }
  };
}

export default UserController;
