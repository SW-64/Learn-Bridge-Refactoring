import express from 'express';
import GradesRepository from '../repositories/grades.repository.js';
import GradesService from '../services/grades.service.js';
import GradesController from '../controllers/grades.controller.js';
import { prisma } from '../utils/prisma.utils.js';
import { requireAccessToken } from '../middlewares/require-access-token.middleware.js';
import { verifySchoolUser } from '../middlewares/verify-school-user.middleware.js';
import { verifyHomeroomTeacher } from '../middlewares/verify-homeroom-teacher-middleware.js';

const gradesRouter = express.Router({ mergeParams: true });
const gradesRepository = new GradesRepository(prisma);
const gradesService = new GradesService(gradesRepository);
const gradesController = new GradesController(gradesService);

// 성적 입력
gradesRouter.post(
  '/students/:studentId',
  requireAccessToken('TEACHER'),
  verifySchoolUser,
  gradesController.createGrades,
);

// 성적 조회
gradesRouter.get(
  '/students/:studentId',
  requireAccessToken(''),
  verifySchoolUser,
  gradesController.getGrades,
);

// 성적 수정
gradesRouter.patch(
  '/students/:studentId',
  requireAccessToken('TEACHER'),
  verifySchoolUser,
  gradesController.updateGrades,
);

// 반 학생의 전체 성적 조회
gradesRouter.get(
  '/class/:classId',
  requireAccessToken('TEACHER'),
  verifySchoolUser,
  verifyHomeroomTeacher,
  gradesController.getClassGrades,
);
export { gradesRouter };
