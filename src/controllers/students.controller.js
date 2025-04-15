import { HTTP_STATUS } from '../constants/http-status.constant.js';
import { MESSAGES } from '../constants/message.constant.js';
import StudentsService from '../services/students.service.js';

class StudentsController {
  studentsService = new StudentsService();

  //반 학생 목록 조회
  getClassStudent = async (req, res, next) => {
    try {
      const { classId } = req.params;

      const data = await this.studentsService.getClassStudent(+classId); // + => 타입을 숫자로 강제 변환

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '반 학생 목록 조회 성공',
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  //특정 학생 상세 조회
  getOneStudent = async (req, res, next) => {
    try {
      const { studentId } = req.params; // studnetId 만 추출 ex) 객체 { studentId: "1" }

      const data = await this.studentsService.getOneStudent(+studentId);

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '학생 상세정보 조회 성공',
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  //특정 학생 정보 수정
  updateOneStudent = async (req, res, next) => {
    try {
      const { studentId } = req.params; //id와 수정정보를를 받음
      const updateData = req.body;

      const data = await this.studentsService.updateOneStudent(
        +studentId,
        updateData,
      ); //받은 값들을 매개변수로 연결

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '학생 상세정보 수정 성공',
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  //특정 학생 정보 삭제
  deleteOneStudent = async (req, res, next) => {
    try {
      const { studentId } = req.params;

      const data = await this.studentsService.deleteOneStudent(+studentId);

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '학생 상세정보 삭제 성공',
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  // 특정 학생 정보 검색
  searchStudent = async (req, res, next) => {
    try {
      const { name } = req.query;

      const data = await this.studentsService.searchStudent(name);
      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '학생 상세정보 검색 성공',
        data,
      });
    } catch (err) {
      next(err);
    }
  };
}
export default StudentsController;
