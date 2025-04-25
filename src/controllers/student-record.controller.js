import { HTTP_STATUS } from '../constants/http-status.constant.js';
import StudentRecordService from '../services/student-record.service.js';

class StudentRecordController {
  studentRecordService = new StudentRecordService();

  // 특정 학생 해당 학기 출석 조회
  getStudentAttendance = async (req, res, next) => {
    const { studentId } = req.params;
    const { semester } = req.query;

    try {
      const data = await this.studentRecordService.getStudentAttendance(
        +studentId,
        +semester,
      );
      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '특정 학생 해당 학기 출석 조회 성공',
        data,
      });
    } catch (error) {
      next(error);
    }
  };
  // 특정 학생 해당 학기 출석 작성 / 수정
  createStudentAttendance = async (req, res, next) => {
    const { studentId } = req.params;
    const { semester, attendance } = req.body;

    try {
      const data = await this.studentRecordService.createStudentAttendance(
        +studentId,
        semester,
        attendance,
      );
      return res.status(HTTP_STATUS.CREATED).json({
        status: HTTP_STATUS.CREATED,
        message: '특정 학생 해당 학기 출석 작성 / 수정 성공',
        data,
      });
    } catch (error) {
      next(error);
    }
  };
  // 특정 학생 출결 정보 조회
  getStudentAttendanceStats = async (req, res, next) => {
    const { studentId } = req.params;

    try {
      const data =
        await this.studentRecordService.getStudentAttendanceStats(+studentId);
      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '특정 학생 출결 정보 조회 성공',
        data,
      });
    } catch (error) {
      next(error);
    }
  };
  // 특기 사항 조회
  getStudentExtraInfo = async (req, res, next) => {
    const { studentId } = req.params;
    const { semester } = req.body;
    try {
      const data = await this.studentRecordService.getStudentExtraInfo(
        +studentId,
        semester,
      );
      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '특기 사항 조회 성공',
        data,
      });
    } catch (error) {
      next(error);
    }
  };
  // 특기 사항 작성 / 수정
  createStudentExtraInfo = async (req, res, next) => {
    const { studentId } = req.params;
    const { semester, extraInfo } = req.body;

    try {
      const data = await this.studentRecordService.createStudentExtraInfo(
        +studentId,
        extraInfo,
        semester,
      );
      return res.status(HTTP_STATUS.CREATED).json({
        status: HTTP_STATUS.CREATED,
        message: '특기 사항 작성 / 수정 성공',
        data,
      });
    } catch (error) {
      next(error);
    }
  };
  // 반 학생 출석 조회
  getClassAttendance = async (req, res, next) => {
    const { classId } = req.params;
    const { date } = req.query;

    try {
      const data = await this.studentRecordService.getClassAttendance(
        +classId,
        date,
      );
      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '반 학생 출석 조회 성공',
        data,
      });
    } catch (error) {
      next(error);
    }
  };
  // 반 학생 출석 작성 / 수정
  createClassAttendance = async (req, res, next) => {
    const { classId } = req.params;
    const { date, attendance, semester } = req.body;

    try {
      const data = await this.studentRecordService.createClassAttendance(
        +classId,
        date,
        attendance,
        semester,
      );
      return res.status(HTTP_STATUS.CREATED).json({
        status: HTTP_STATUS.CREATED,
        message: '반 학생 출석 작성 / 수정 성공',
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default StudentRecordController;
