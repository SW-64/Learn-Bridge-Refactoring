import UserService from '../services/user.service.js';
import { HTTP_STATUS } from '../constants/http-status.constant.js';


class UserController {
  userService = new UserService();

  // 담임 설정 및 반 생성
  assignHomeRoom = async (req, res, next) => {
    try {
      const { grade, gradeClass, teacherId } = req.body;
      

      console.log('Teacher ID:', teacherId);

      if (!teacherId) {
        return res.status(400).json({  // 400으로 직접 상태 코드 처리
          status: 400,
          message: 'Teacher ID is required',
        });
      }
      
      const data = await this.userService.assignHomeRoom(grade, gradeClass, +teacherId);

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
