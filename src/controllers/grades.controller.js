import { HTTP_STATUS } from '../constants/http-status.constant.js';
import GradesService from '../services/grades.service.js';

class GradesController {
  gradesService = new GradesService();

  // 성적 입력
  createGrades = async (req, res, next) => {
    try {
      // 학년, 학기, 과목, 점수 값 받기
      const { schoolYear, semester, subject, score } = req.body;

      // 학생 ID 파라미터로 받기
      const { studentId } = req.params;

      const grades = await this.gradesService.createGrades(
        schoolYear,
        semester,
        subject,
        score,
        +studentId,
      );
      return res.status(HTTP_STATUS.CREATED).json({
        status: HTTP_STATUS.CREATED,
        message: '성적 입력 완료 ',
        grades,
      });
    } catch (err) {
      next(err);
    }
  };
  // 성적 조회
  getGrades = async (req, res, next) => {
    try {
      // 학생 ID 파라미터로 받기
      const { studentId } = req.params;

      // 쿼리문으로 과목 or ( 학년, 학기 ) 값 받기
      const { subject, schoolYear, semester } = req.query;
      console.log(subject, schoolYear, semester);

      const grades = await this.gradesService.getGrades(
        +schoolYear,
        +semester,
        subject,
        +studentId,
      );
      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '성적 조회 완료 ',
        grades,
      });
    } catch (err) {
      next(err);
    }
  };
  // 성적 수정
  updateGrades = async (req, res, next) => {
    try {
      // 학생 ID 파라미터로 받기
      const { studentId } = req.params;

      // 학년, 학기, 과목, 점수 값 받기
      const { schoolYear, semester, subject, score } = req.body;

      const grades = await this.gradesService.updateGrades(
        schoolYear,
        semester,
        subject,
        studentId,
        score,
      );
      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '성적 수정 완료 ',
        grades,
      });
    } catch (err) {
      next(err);
    }
  };
}

export default GradesController;
