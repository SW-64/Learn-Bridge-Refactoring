import jwt from 'jsonwebtoken';
import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import { ACCESS_TOKEN_SECRET } from '../constants/env.constant.js';
import AuthRepository from '../repositories/auth.repository.js';
import { prisma } from '../utils/prisma.utils.js';
const authRepository = new AuthRepository(prisma);
export const requireAccessToken = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const authorization = req.headers.authorization;

      if (!authorization) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: MESSAGES.AUTH.COMMON.JWT.NO_TOKEN,
        });
      }

      const [type, accessToken] = authorization.split(' ');

      if (type !== 'Bearer') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: MESSAGES.AUTH.COMMON.JWT.NOT_SUPPORTED_TYPE,
        });
      }

      if (!accessToken) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: MESSAGES.AUTH.COMMON.JWT.NO_TOKEN,
        });
      }

      let payload;
      try {
        payload = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
      } catch (error) {
        // accessToken 유효기간 만료된 경우
        if (error.name === 'TokenExpiredError') {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            status: HTTP_STATUS.UNAUTHORIZED,
            message: MESSAGES.AUTH.COMMON.JWT.EXPIRED,
          });
        }
        // 그 밖의 accessToken 검증에 실패한 경우
        else {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            status: HTTP_STATUS.UNAUTHORIZED,
            message: MESSAGES.AUTH.COMMON.JWT.INVALID,
          });
        }
      }

      // payload에 담긴 사용자 id와 일치하는 사용자가 없는 경우
      const { id, role } = payload;

      const user = await authRepository.findUserById(id);

      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: MESSAGES.AUTH.COMMON.JWT.NO_USER,
        });
      }
      if (requiredRole) {
        // 해당 권한이 맞지 않을 경우, 에러 반환
        if (role != requiredRole) {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            status: HTTP_STATUS.UNAUTHORIZED,
            message: '해당 권한이 없습니다.',
          });
        }
      }

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};
