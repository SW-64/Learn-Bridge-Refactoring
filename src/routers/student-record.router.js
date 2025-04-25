import express from 'express';
import StudentRecordRepository from '../repositories/student-record.repository.js';
import { prisma } from '../utils/prisma.utils.js';
import { requireAccessToken } from '../middlewares/require-access-token.middleware.js';
import { verifySchoolUser } from '../middlewares/verify-school-user.middleware.js';
import StudentRecordController from '../controllers/student-record.controller.js';
import StudentRecordService from '../services/student-record.service.js';
import { verifyHomeroomTeacher } from '../middlewares/verify-homeroom-teacher-middleware.js';

const studentRecordRouter = express.Router({ mergeParams: true });
const studentRecordRepository = new StudentRecordRepository(prisma);
const studentRecordService = new StudentRecordService(studentRecordRepository);
const studentRecordController = new StudentRecordController(
  studentRecordService,
);

// 특정 학생 해당 학기 출석 조회
studentRecordRouter.get(
  '/attendance/students/:studentId',
  requireAccessToken('TEACHER'),
  verifySchoolUser,
  studentRecordController.getStudentAttendance,
);
// 특정 학생 해당 학기 출석 작성 / 수정
studentRecordRouter.post(
  '/attendance/students/:studentId',
  requireAccessToken('TEACHER'),
  verifySchoolUser,
  studentRecordController.createStudentAttendance,
);
// 특정 학생 출결 정보 조회
studentRecordRouter.get(
  '/attendance-stats/students/:studentId',
  requireAccessToken('TEACHER'),
  verifySchoolUser,
  studentRecordController.getStudentAttendanceStats,
);
// 특기 사항 조회
studentRecordRouter.get(
  '/extra-info/students/:studentId',
  requireAccessToken('TEACHER'),
  verifySchoolUser,
  studentRecordController.getStudentExtraInfo,
);
// 특기 사항 작성 / 수정
studentRecordRouter.post(
  '/extra-info/students/:studentId',
  requireAccessToken('TEACHER'),
  verifySchoolUser,
  studentRecordController.createStudentExtraInfo,
);
// 반 학생 출석 조회
studentRecordRouter.get(
  '/attendance/class/:classId',
  requireAccessToken('TEACHER'),
  verifyHomeroomTeacher,
  verifySchoolUser,
  studentRecordController.getClassAttendance,
);
// 반 학생 출석 작성 / 수정
studentRecordRouter.post(
  '/attendance/class/:classId',
  requireAccessToken('TEACHER'),
  verifyHomeroomTeacher,
  verifySchoolUser,
  studentRecordController.createClassAttendance,
);
export { studentRecordRouter };
