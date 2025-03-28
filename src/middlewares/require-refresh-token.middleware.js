import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { REFRESH_TOKEN_SECRET } from '../constants/env.constant.js';
import AuthRepository from '../repositories/auth.repository.js';
import { prisma } from '../utils/prisma.utils.js';
const authRepository = new AuthRepository(prisma);
export const requireRefreshToken = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: 'MESSAGES.AUTH.COMMON.JWT.NO_TOKEN',
      });
    }

    const [type, refreshToken] = authorization.split(' ');

    if (type !== 'Bearer') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: 'MESSAGES.AUTH.COMMON.JWT.NOT_SUPPORTED_TYPE',
      });
    }

    if (!refreshToken) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: 'MESSAGES.AUTH.COMMON.JWT.NO_TOKEN',
      });
    }

    let payload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch (error) {
      // refreshToken 유효기간 만료된 경우
      if (error.name === 'TokenExpiredError') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: 'MESSAGES.AUTH.COMMON.JWT.EXPIRED',
        });
      }
      // 그 밖의 refreshToken 검증에 실패한 경우
      else {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: 'MESSAGES.AUTH.COMMON.JWT.INVALID',
        });
      }
    }
    const { id } = payload;
    //DB에서 refreshToken 조회
    const existedRefreshToken = await authRepository.findRefreshToken(id);

    const isValidRefreshToken =
      existedRefreshToken?.refreshToken &&
      bcrypt.compareSync(refreshToken, existedRefreshToken.refreshToken);

    if (!isValidRefreshToken) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: 'MESSAGES.AUTH.COMMON.JWT.DISCARDED_TOKEN',
      });
    }

    //넘겨 받은 refreshToken과 비교

    // payload에 담긴 사용자 id와 일치하는 사용자가 없는 경우

    const user = await authRepository.findUserById(id);

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: 'MESSAGES.AUTH.COMMON.JWT.NO_USER',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
