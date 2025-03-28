import AuthRepository from '../repositories/auth.repository.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  ConflictError,
  UnauthorizedError,
  BadRequestError,
} from '../errors/http.error.js';
import { authConstant } from '../constants/auth.constant.js';
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from '../constants/env.constant.js';
import { MESSAGES } from '../constants/message.constant.js';

class AuthService {
  authRepository = new AuthRepository();

  signUp = async ({
    email,
    name,
    role,
    password,
    photo,
    passwordCheck,
    subject,
    grade,
    number,
    gradeClass,
  }) => {
    // 이메일이 이미 존재한다면 에러 반환
    const existedUser = await this.authRepository.findUserByEmail(email);
    if (existedUser) {
      throw new ConflictError(MESSAGES.AUTH.COMMON.EMAIL.DUPLICATED);
    }

    // 비밀번호와 비밀번호 확인이 맞지않다면 에러 반환
    if (password !== passwordCheck) {
      throw new ConflictError(
        MESSAGES.AUTH.COMMON.PASSWORD_CHECK.NOT_MATCHTED_WITH_PASSWORD,
      );
    }

    // 학생이 과목을 작성할려는 경우 에러발생
    if (role == 'STUDENT' && subject) {
      throw new BadRequestError(MESSAGES.AUTH.SIGN_UP.STUDENT_INVALID);
    }

    // 선생님이 학년, 반, 출석번호를 작성하려는 경우 에러발생
    if (role == 'TEACHER' && (grade || number || gradeClass)) {
      throw new BadRequestError(MESSAGES.AUTH.SIGN_UP.TEACHER_INVALID);
    }

    const data = await this.authRepository.create({
      email,
      name,
      role,
      password,
      photo,
      subject,
      grade,
      number,
      gradeClass,
    });

    return data;
  };

  signIn = async ({ email, password }) => {
    const user = await this.authRepository.findUserByEmail(email);

    const passwordCheck = user && bcrypt.compareSync(password, user.password);

    if (!passwordCheck) {
      throw new UnauthorizedError(MESSAGES.AUTH.COMMON.UNAUTHORIZED);
    }

    const payload = { id: user.id, role: user.role };

    // accessToken, refreshToken 생성
    const data = await this.generateAuthTokens(payload);

    return data;
  };

  signOut = async (user) => {
    const data = await this.authRepository.signOut(user);

    return data;
  };

  token = async (user) => {
    const payload = { id: user.id, role: user.role };
    const data = await this.generateAuthTokens(payload);

    return data;
  };

  //토큰 발급 함수
  generateAuthTokens = async (payload) => {
    const userId = payload.id;

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: authConstant.ACCESS_TOKEN_EXPIRED_IN,
    });
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: authConstant.REFRESH_TOKEN_EXPIRED_IN,
    });

    await this.authRepository.upsertRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken };
  };
}

export default AuthService;
