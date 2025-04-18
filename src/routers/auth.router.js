import express from 'express';
import AuthRepository from '../repositories/auth.repository.js';
import { prisma } from '../utils/prisma.utils.js';
import AuthService from '../services/auth.service.js';
import AuthController from '../controllers/auth.controller.js';
import { requireRefreshToken } from '../middlewares/require-refresh-token.middleware.js';
import { requireAccessToken } from '../middlewares/require-access-token.middleware.js';

const authRouter = express.Router();
const authRepository = new AuthRepository(prisma);
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

// 회원가입
authRouter.post('/sign-up', authController.signUp);

// 로그인
authRouter.post('/sign-in', authController.signIn);

// 로그아웃
authRouter.post('/sign-out', requireRefreshToken, authController.signOut);

// 토큰 재발급
authRouter.post('/token', requireRefreshToken, authController.Token);

// 카카오 로그인 시도
authRouter.get(
  '/kakao/sign-in',
  passport.authenticate('kakao', {
    session: false,
    authType: 'reprompt',
  }),
);

// 카카오 로그인 정보 반환
authRouter.get(
  '/kakao/callback',
  passport.authenticate('kakao', {
    session: false,
  }),
  authController.kakaoSignIn,
);

// 카카오 로그인 추가 정보 입력
authRouter.post(
  '/kakao/info',
  requireAccessToken(),
  authController.addKakaoInfo,
);
export { authRouter };
