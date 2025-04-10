import { HTTP_STATUS } from '../constants/http-status.constant';

export const verifySchoolUser = (req, res, next) => {
  const { user } = req;
  const { schoolId } = req.params;

  if (user.schoolId !== schoolId) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      status: HTTP_STATUS.FORBIDDEN,
      message: '학교 권한이 없습니다.',
    });
  }

  next();
};
