import AuthService from '../services/auth.service.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import passport from 'passport';
import '../strategies/kakao-link.strategy.js';
import redis from '../utils/redis.util.js';
import {
  KAKAO_CLIENT_ID,
  KAKAO_CONNECT_CALLBACK_URI,
} from '../constants/env.constant.js';
class AuthController {
  authService = new AuthService();

  // 회원가입
  signUp = async (req, res, next) => {
    try {
      const schoolId = req.user.schoolId;

      const {
        name,
        role,
        email,
        phonenumber,
        homenumber,
        address,
        subject,
        grade,
      } = req.body;

      const data = await this.authService.signUp({
        name,
        role,
        email,
        phonenumber,
        homenumber,
        address,
        subject,
        grade,
        schoolId,
      });

      return res.status(HTTP_STATUS.CREATED).json({
        status: HTTP_STATUS.CREATED,
        message: MESSAGES.AUTH.SIGN_UP.SUCCEED,
        data: {
          ...data,
          password: data.rawPassword,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // 학부모 회원가입
  parentsSignUp = async (req, res, next) => {
    try {
      const { loginId, schoolId, id: userId, name } = req.user;
      console.log('loginId:', loginId, typeof loginId);
      console.log('schoolId:', schoolId, typeof schoolId);

      const data = await this.authService.parentsSignUp({
        loginId,
        schoolId,
        userId,
        name,
      });

      return res.status(HTTP_STATUS.CREATED).json({
        status: HTTP_STATUS.CREATED,
        message: MESSAGES.AUTH.SIGN_UP.SUCCEED,
        data: {
          ...data,
          password: data.rawPassword,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // 로그인
  signIn = async (req, res, next) => {
    try {
      const { loginId, password } = req.body;

      const data = await this.authService.signIn({ loginId, password });

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.AUTH.SIGN_IN.SUCCEED,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // 로그아웃
  signOut = async (req, res, next) => {
    try {
      const user = req.user;
      const data = await this.authService.signOut(user);

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.AUTH.SIGN_OUT.SUCCEED,
        data: { id: user.id },
      });
    } catch (error) {
      next(error);
    }
  };

  // 토큰 재발급
  Token = async (req, res, next) => {
    try {
      const user = req.user;
      const data = await this.authService.token(user);

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: MESSAGES.AUTH.TOKEN.SUCCEED,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // 카카오 로그인 정보 반환
  kakaoSignIn = async (req, res, next) => {
    try {
      const user = req.user;
      const { accessToken, refreshToken, classId, schoolId } = user;
      const frontendRedirectUrl =
        'https://software-design-frontend-for-vercel-ixgf.vercel.app';

      const query = new URLSearchParams({
        accessToken,
        refreshToken,
        classId: String(classId),
        schoolId: String(schoolId),
      });
      console.log(query.toString());
      return res.redirect(`${frontendRedirectUrl}?${query}`);
    } catch (error) {
      next(error);
    }
  };
  // 카카오 로그인 추가 정보 입력
  addKakaoInfo = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { name, role, subject, grade, gradeClass, number, schoolName } =
        req.body;

      const data = await this.authService.addKakaoInfo(
        userId,
        name,
        role,
        subject,
        grade,
        gradeClass,
        number,
        schoolName,
      );

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: 'MESSAGES.AUTH.SOCIAL.KAKAKO.MORE_INFO',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  redirectAfterKakaoConnect = async (req, res, next) => {
    try {
      const uuid = req.query.state;
      console.log('UUID:', uuid);
      if (!uuid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'UUID가 필요합니다.',
        });
      }

      const token = await redis.get(`kakao-link:${uuid}`);
      if (!token) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          status: HTTP_STATUS.BAD_REQUEST,
          message: '유효하지 않은 UUID입니다.',
        });
      }
      const frontendRedirectUrl =
        'https://software-design-frontend-for-vercel-ixgf.vercel.app?kakaoStatus=success';

      return res.redirect(`${frontendRedirectUrl}`);
    } catch (error) {
      next(error);
    }
  };

  kakaoConnect = async (req, res, next) => {
    try {
      const token = req.query.token;
      if (!token) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          status: HTTP_STATUS.BAD_REQUEST,
          message: '토큰이 필요합니다.',
        });
      }
      const uuid = crypto.randomUUID();

      await redis.set(`kakao-link:${uuid}`, token, 'EX', 300);
      const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(KAKAO_CONNECT_CALLBACK_URI)}&response_type=code&state=${uuid}`;
      console.log('Kakao Auth URL:', kakaoAuthUrl);
      return res.redirect(kakaoAuthUrl);
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
