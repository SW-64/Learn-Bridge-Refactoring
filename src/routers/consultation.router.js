import express from 'express';

import { prisma } from '../utils/prisma.utils.js';
import ConsultationRepository from '../repositories/consultation.repository.js';
import ConsultationService from '../services/consultation.service.js';
import ConsultationController from '../controllers/consultation.controller.js';
import { requireAccessToken } from '../middlewares/require-access-token.middleware.js';

const consultationRouter = express.Router({ mergeParams: true });
const consultationRepository = new ConsultationRepository(prisma);
const consultationService = new ConsultationService(consultationRepository);
const consultationController = new ConsultationController(consultationService);

// 특정 학생 상담 내역 전체 조회
consultationRouter.get(
  '/students/:studentId',
  requireAccessToken('TEACHER'),
  consultationController.getAllConsultation,
);

// 특정 기준 별 상담 내역 조회 (기간, 과목, 제목, 작성자)
consultationRouter.get(
  '/students/:studentId/search',
  requireAccessToken('TEACHER'),
  consultationController.getConsultation,
);

// 상담 기록 입력
consultationRouter.post(
  '/students/:studentId',
  requireAccessToken('TEACHER'),
  consultationController.createConsultation,
);

// 상담 내용 수정
consultationRouter.patch(
  '/:consultationId/students/:studentId',
  requireAccessToken('TEACHER'),
  consultationController.updateConsultation,
);

export { consultationRouter };
