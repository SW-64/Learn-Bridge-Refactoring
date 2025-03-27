import express from 'express';

import { prisma } from '../utils/prisma.utils.js';
import ConsultationRepository from '../repositories/consultation.repository.js';
import ConsultationService from '../services/consultation.service.js';
import ConsultationController from '../controllers/consultation.controller.js';

const consultationRouter = express.Router();
const consultationRepository = new ConsultationRepository(prisma);
const consultationService = new ConsultationService(consultationRepository);
const consultationController = new ConsultationController(consultationService);

export { consultationRouter };
