import passport from 'passport';
import { Strategy as kakaoStrategy } from 'passport-kakao';
import { prisma } from '../utils/prisma.utils.js';
import AuthService from '../services/auth.service.js';
import {
  KAKAO_CLIENT_SECRET,
  KAKAO_CLIENT_ID,
  KAKAO_CALLBACK_URL,
} from './../constants/env.constant';

const authService = new AuthService();
passport.use(
  new kakaoStrategy(
    {
      clientID: KAKAO_CLIENT_ID,
      clientSecret: KAKAO_CLIENT_SECRET,
      callbackURL: KAKAO_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existedUser = await prisma.user.findUnique({
          where: { email: profile._json.kakao_account.email },
        });
        if (existedUser) {
          // 이미 존재하는 유저인 경우에도 로그인시 토큰 발급
          const token = await authService.generateAuthTokens({
            id: existedUser.id,
          });
          const userData = {
            id: existedUser.id,
            email: existedUser.email,
            schoolId: existedUser.schoolId,
            photo: existedUser.photo,
            name: existedUser.name,
            role: existedUser.role,
            token,
            createdAt: existedUser.createdAt,
            updatedAt: existedUser.updatedAt,
          };

          return done(null, userData);
        } else {
          const user = await prisma.user.create({
            data: {
              email: profile._json.kakao_account.email,
              name: profile._json.properties.nickname,
              role: null,
              schoolId: 1, // 임시 학교
            },
          });

          const token = await authService.generateAuthTokens({
            id: user.id,
          });

          const userData = {
            id: user.id,
            email: user.email,
            schoolId: user.schoolId,
            photo: user.photo,
            name: user.name,
            role: user.role,
            token,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          };
          // 프론트에서 해당 응답을 보고 추가정보 입력 페이지로 이동하도록 처리
          if (!user.role) {
            return done(null, {
              user,
              needsExtraInfo: true,
              message: MESSAGES.AUTH.SOCIAL.KAKAKO.NEED_INFO,
            });
          }
          done(null, userData);
        }
      } catch (error) {
        console.error('Kakao login error:', error);
        done(error, null);
      }
    },
  ),
);
