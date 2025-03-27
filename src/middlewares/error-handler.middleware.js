import { HTTP_STATUS } from '../constants/http-status.constant.js';

export const globalErrorHandler = (err, req, res, next) => {
  // log Error
  console.error(err.stack);

  if (err instanceof Error && err.statusCode) {
    return res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
    });
  }

  if (err instanceof Error && err.name === 'ValidationError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      status: HTTP_STATUS.BAD_REQUEST,
      message: err.message,
    });
  }

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: '예상치 못한 에러가 발생하였습니다.',
  });
};
