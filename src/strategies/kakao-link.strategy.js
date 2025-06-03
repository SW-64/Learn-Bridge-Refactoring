import passport from 'passport';
import { Strategy as kakaoStrategy } from 'passport-kakao';
import { prisma } from '../utils/prisma.utils.js';
import AuthService from '../services/auth.service.js';
import {
  KAKAO_CLIENT_SECRET,
  KAKAO_CLIENT_ID,
  KAKAO_CONNECT_CALLBACK_URI,
} from '../constants/env.constant.js';
import ClassRepository from '../repositories/class.repository.js';
import { BadRequestError } from '../errors/http.error.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import AuthRepository from '../repositories/auth.repository.js';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../constants/env.constant.js';
import redis from '../utils/redis.util.js';
import { MESSAGES } from '../constants/message.constant.js';
const authService = new AuthService();
const classRepository = new ClassRepository(prisma);
const authRepository = new AuthRepository(prisma);
passport.use(
  'kakao-link',
  new kakaoStrategy(
    {
      clientID: KAKAO_CLIENT_ID,
      clientSecret: KAKAO_CLIENT_SECRET,
      callbackURL: KAKAO_CONNECT_CALLBACK_URI,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const existedUser = await prisma.user.findUnique({
          where: { kakaoEmail: profile._json.kakao_account.email },
          include: { teacher: true, student: true },
        });

        if (existedUser) {
          return done(null, false, { message: `이미 존재하는 유저입니다.` });
        }
        const uuid = req.query.state;
        if (!uuid) {
          throw new BadRequestError(`UUID가 필요합니다. ${uuid}`);
        }

        const accessToken = await redis.get(`kakao-link:${uuid}`);
        if (!accessToken) {
          throw new BadRequestError('유효하지 않은 UUID입니다.');
        }

        if (!accessToken) {
          throw new BadRequestError(MESSAGES.AUTH.COMMON.JWT.NO_TOKEN);
        }

        let payload;
        try {
          payload = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
        } catch (error) {
          // accessToken 유효기간 만료된 경우
          if (error.name === 'TokenExpiredError') {
            throw new BadRequestError(MESSAGES.AUTH.COMMON.JWT.EXPIRED);
          }
          // 그 밖의 accessToken 검증에 실패한 경우
          else {
            throw new BadRequestError(MESSAGES.AUTH.COMMON.JWT.INVALID);
          }
        }

        // payload에 담긴 사용자 id와 일치하는 사용자가 없는 경우
        const { id, role } = payload;

        const user = await authRepository.findUserById(id);

        if (!user) {
          throw new BadRequestError(MESSAGES.AUTH.COMMON.JWT.NO_USER);
        }
        const userId = user.id;
        const userLinkKakao = await prisma.user.update({
          where: { id: userId },
          data: {
            kakaoEmail: profile._json.kakao_account.email,
          },
        });
        return done(null, { message: '카카오 연동 완료' });
      } catch (error) {
        console.error('Kakao login error:', error);
        done(error, null);
      }
    },
  ),
);
