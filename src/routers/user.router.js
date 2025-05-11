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
userRouter.post(
  '/assign-homeroom',
  requireAccessToken('TEACHER'),
  verifySchoolUser,
  userController.assignHomeRoom,
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

// 내 정보 수정 ( 학교, 이름, 사진 변경 )
userRouter.patch(
  '/me',
  requireAccessToken(''),
  verifySchoolUser,
  userController.updateMyInfo,
);

// 인증 코드 확인
userRouter.post(
  '/find-password',
  requireAccessToken(''),
  verifySchoolUser,
  userController.findMyPassword,
);

// 인증 코드 발송
userRouter.get(
  '/code',
  requireAccessToken(''),
  verifySchoolUser,
  userController.sendFindMyPasswordCode,
);

// 새 비밀번호 설정
userRouter.patch(
  '/new-password',
  requireAccessToken(''),
  verifySchoolUser,
  userController.setNewPassword,
);

export { userRouter };
