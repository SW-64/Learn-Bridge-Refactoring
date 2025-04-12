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
export { userRouter };
