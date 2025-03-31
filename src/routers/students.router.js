import express from 'express';
import StudentsRepository from '../repositories/students.repository.js';
import StudentsService from '../services/students.service.js';
import StudentsController from '../controllers/students.controller.js';
import { prisma } from '../utils/prisma.utils.js';
import { requireAccessToken } from '../middlewares/require-access-token.middleware.js';

const studentsRouter = express.Router();
const studentsRepository = new StudentsRepository(prisma);
const studentsService = new StudentsService(studentsRepository);
const studentsController = new StudentsController(studentsService);

//전체 학생 목록 조회
studentsRouter.get('/',requireAccessToken('TEACHER'), studentsController.checkStudentList);

//특정 학생 상세 조회
studentsRouter.get('/:studentId',studentsController.checkStudent)

//특정 학생 정보 수정
studentsRouter.patch('/:studentId',studentsController.updateStudent);

//특정 학생 정보 삭제
studentsRouter.delete('/:studentId',studentsController.deleteStudent);

export { studentsRouter };
