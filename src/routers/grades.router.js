import express from 'express';
import GradesRepository from '../repositories/grades.repository.js';
import GradesService from '../services/grades.service.js';
import GradesController from '../controllers/grades.controller.js';
import { prisma } from '../utils/prisma.utils.js';

const gradesRouter = express.Router();
const gradesRepository = new GradesRepository(prisma);
const gradesService = new GradesService(gradesRepository);
const gradesController = new GradesController(gradesService);

export { gradesRouter };
