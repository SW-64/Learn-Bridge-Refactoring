import express from 'express';
import StudentRecordRepository from '../repositories/student-record.repository.js';
import StudentsService from '../services/students.service.js';
import StudentsController from '../controllers/students.controller.js';
import { prisma } from '../utils/prisma.utils.js';

const studentRecordRouter = express.Router();
const studentRecordRepository = new StudentRecordRepository(prisma);
const studentRecordService = new StudentsService(studentRecordRepository);
const studentRecordController = new StudentsController(studentRecordService);

export { studentRecordRouter };
