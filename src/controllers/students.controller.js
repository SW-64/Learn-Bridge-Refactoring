import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import StudentsService from '../services/students.service.js';

class StudentsController {
  studentsService = new StudentsService();

  ////전체 학생 목록 조회
  checkStudentList = async (req, res, next) => {
    try{
      const userId = req.user.id

      const data = await this.studentsService.checkStudentList(userId);

      return res.status(HTTP_STATUS.OK).json({
              status: HTTP_STATUS.OK,
              message:"전체 학생 목록 조회 성공",
              data,
      });
    }

    catch(err){
      next(err)
    }
  }
}
export default StudentsController;
