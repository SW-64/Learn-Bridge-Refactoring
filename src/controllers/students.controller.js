import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import StudentsService from '../services/students.service.js';

class StudentsController {
  studentsService = new StudentsService();

  //전체 학생 목록 조회
  checkStudentList = async (req, res, next) => {
    try{
      const userId = req.user.id;

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

  //특정 학생 상세 조회
  checkStudent = async (req, res, next) => {
    try{
      const {studentId} = req.params; //{ } 안에 속성만 추출출

      const data = await this.studentsService.checkStudent(studentId);
      
      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: "학생 상세정보 조회 성공",
        data,
      });
    } 
    
    catch (err){
      next(err);
    }
  }

  //특정 학생 정보 수정
  updateStudent = async (req, res, next) => {
    try{
      const {studentId} = req.params; //id와 수정사항을 받음
      const updateData = req.body;

      const data = await this.studentsService.updateStudent(studentId,updateData); //받은 값들을 매개변수로 연결

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: "학생 상세정보 수정 성공",
        data,
      });

    }
    catch (err){
      next(err);
    }
  }

  //특정 학생 정보 삭제
  deleteStudent = async (req, res, next) => {
    try{
      const {studentId} = req.params;

      const data = await this.studentsService.deleteStudent(studentId);

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: "학생 상세정보 삭제 성공",
        data,
      });

    }
    catch(err){
      next(err);
    }
  }

}
export default StudentsController;
