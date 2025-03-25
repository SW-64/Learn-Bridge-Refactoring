import { HTTP_STATUS } from '../constants/http-status.constant.js';
class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends HttpError {
  constructor(message = 'Bad Request') {
    super(HTTP_STATUS.BAD_REQUEST, message);
  }
}

class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(HTTP_STATUS.UNAUTHORIZED, message);
  }
}

class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden') {
    super(HTTP_STATUS.FORBIDDEN, message);
  }
}

class NotFoundError extends HttpError {
  constructor(message = 'Not Found') {
    super(HTTP_STATUS.NOT_FOUND, message);
  }
}

class ConflictError extends HttpError {
  constructor(message = 'Conflict') {
    super(HTTP_STATUS.CONFLICT, message);
  }
}

class InternalServerError extends HttpError {
  constructor(message = 'Internal Server Error') {
    super(HTTP_STATUS.INTERNAL_SERVER_ERROR, message);
  }
}

export {
  HttpError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
};
