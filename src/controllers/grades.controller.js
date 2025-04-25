import { HTTP_STATUS } from '../constants/http-status.constant.js';
import GradesService from '../services/grades.service.js';

class GradesController {
  gradesService = new GradesService();

  // 성적 입력
  createGrades = async (req, res, next) => {
    try {
      // 학년, 학기, 과목, 점수 값 받기
      const gradesList = req.body; //{ schoolYear, semester, subject, score }

      // 학생 ID 파라미터로 받기
      const { studentId } = req.params;
      const gradesWithStudentId = gradesList.map((grade) => ({
        ...grade,
        studentId: +studentId,
      }));
      const grades = await this.gradesService.createGrades(gradesWithStudentId);
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
      const gradesList = req.body;
      const gradesWithStudentId = gradesList.map((grade) => ({
        ...grade,
        studentId: +studentId,
      }));
      const grades = await this.gradesService.updateGrades(gradesWithStudentId);
      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '성적 수정 완료 ',
        grades,
      });
    } catch (err) {
      next(err);
    }
  };

  // 반 학생의 전체 성적 조회
  getClassGrades = async (req, res, next) => {
    try {
      const { classId } = req.params;
      const { semester } = req.query;

      const grades = await this.gradesService.getClassGrades(
        +classId,
        +semester,
      );
      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '반 학생의 성적 조회 완료 ',
        grades,
      });
    } catch (err) {
      next(err);
    }
  };
}

export default GradesController;
