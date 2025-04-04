import UserService from '../services/user.service.js';

class UserController {
  userService = new UserService();

  // 담임 설정 및 반 생성
  assignHomeRoom = async (req, res, next) => {
    try {
      const { grade, gradeClass } = req.body;

      const data = await this.userService.assignHomeRoom(grade, gradeClass);

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '담임 설정 및 반 생성 성공',
        data,
      });
    } catch (err) {
      next(err);
    }
  };
}

export default UserController;
