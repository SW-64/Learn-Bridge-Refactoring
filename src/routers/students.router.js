import express from 'express';
import StudentsRepository from '../repositories/students.repository.js';
import StudentsService from '../services/students.service.js';
import StudentsController from '../controllers/students.controller.js';
import { prisma } from '../utils/prisma.utils.js';

const studentsRouter = express.Router();
const studentsRepository = new StudentsRepository(prisma);
const studentsService = new StudentsService(studentsRepository);
const studentsController = new StudentsController(studentsService);

export { studentsRouter };
