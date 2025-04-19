import passport from 'passport';
import { Strategy as kakaoStrategy } from 'passport-kakao';
import { prisma } from '../utils/prisma.utils.js';
import AuthService from '../services/auth.service.js';
import {
  KAKAO_CLIENT_SECRET,
  KAKAO_CLIENT_ID,
  KAKAO_CALLBACK_URL,
} from '../constants/env.constant.js';
import ClassRepository from '../repositories/class.repository.js';

const authService = new AuthService();
const classRepository = new ClassRepository(prisma);
passport.use(
  new kakaoStrategy(
    {
      clientID: KAKAO_CLIENT_ID,
      clientSecret: KAKAO_CLIENT_SECRET,
      callbackURL: KAKAO_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Kakao profile:', profile);
        const existedUser = await prisma.user.findUnique({
          where: { email: profile._json.kakao_account.email },
          include: { teacher: true, student: true },
        });
        if (existedUser) {
          // 이미 존재하는 유저인 경우에도 로그인시 토큰 발급
          const token = await authService.generateAuthTokens({
            id: existedUser.id,
            role: existedUser.role,
            schoolId: existedUser.schoolId,
          });
          // 담임일 경우 classId 반환
          console.log(existedUser);
          const teacherId =
            existedUser.role === 'TEACHER'
              ? existedUser.teacher.teacherId
              : null;
          const classData = teacherId
            ? await classRepository.findClassByTeacherId(teacherId)
            : null;
          const classId = classData ? classData.classId : null;
          const userData = {
            ...token,
            classId,
          };

          return done(null, userData);
        } else {
          // 존재하지 않은 유저일 때, 회원가입
          const user = await prisma.user.create({
            data: {
              school: {
                connect: { schoolId: 1 },
              },
              name: null,
              role: null,
              email: profile._json.kakao_account.email,
              password: null,
            },
          });
          const token = await authService.generateAuthTokens({
            id: user.id,
          });
          const userWithToken = {
            ...user,
            token,
          };
          return done(null, {
            userWithToken,
            needsExtraInfo: true,
            message: 'MESSAGES.AUTH.SOCIAL.KAKAKO.NEED_INFO',
          });
        }
      } catch (error) {
        console.error('Kakao login error:', error);
        done(error, null);
      }
    },
  ),
);
