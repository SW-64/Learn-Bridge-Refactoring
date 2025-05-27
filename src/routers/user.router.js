import express from 'express';
import UserRepository from '../repositories/user.repository.js';
import { prisma } from '../utils/prisma.utils.js';
import UserService from '../services/user.service.js';
import UserController from '../controllers/user.controller.js';
import { requireAccessToken } from '../middlewares/require-access-token.middleware.js';
import { verifySchoolUser } from '../middlewares/verify-school-user.middleware.js';

const userRouter = express.Router({ mergeParams: true });
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// 담임 설정 및 반 생성
// userRouter.post(
//   '/assign-homeroom',
//   requireAccessToken('TEACHER'),
//   verifySchoolUser,
//   userController.assignHomeRoom,
// );

// 반 생성
userRouter.post(
  '/class',
  requireAccessToken('ADMIN'),
  verifySchoolUser,
  userController.createClasses,
);

// 반 목록 조회
userRouter.get(
  '/class',
  requireAccessToken('ADMIN'),
  verifySchoolUser,
  userController.getClasses,
);
// 교사 목록 조회 (담임,비담임)
userRouter.get(
  '/class/:classId/homeroom',
  requireAccessToken('ADMIN'),
  verifySchoolUser,
  userController.getTeachers,
);

// 반 학생 서버 저장
userRouter.patch(
  '/class/:classId/managestudent',
  requireAccessToken('ADMIN'),
  verifySchoolUser,
  userController.manageClassStudent,
);

// 반 교사 서버 저장
userRouter.patch(
  '/class/:classId/manageteacher',
  requireAccessToken('ADMIN'),
  verifySchoolUser,
  userController.manageClassTeacher,
);

// 내 정보 조회
userRouter.get(
  '/me',
  requireAccessToken(''),
  verifySchoolUser,
  userController.getMyInfo,
);

// 내 비밀번호 수정
userRouter.patch(
  '/password',
  requireAccessToken(''),
  verifySchoolUser,
  userController.updateMyPassword,
);

// 내 정보 수정 (사진 변경)
userRouter.patch(
  '/me',
  requireAccessToken(''),
  verifySchoolUser,
  userController.updateMyInfo,
);

export { userRouter };
