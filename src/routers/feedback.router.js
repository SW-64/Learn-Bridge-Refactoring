import express from 'express';
import FeedbackRepository from '../repositories/feedback.repository.js';
import { prisma } from '../utils/prisma.utils.js';
import FeedbackService from '../services/feedback.service.js';
import FeedbackController from '../controllers/feedback.controller.js';

const feedbackRouter = express.Router();
const feedbackRepository = new FeedbackRepository(prisma);
const feedbackService = new FeedbackService(feedbackRepository);
const feedbackController = new FeedbackController(feedbackService);

// 피드백 작성
feedbackRouter.post('/students/:studentId', feedbackController.createFeedback);

// 피드백 수정
feedbackRouter.patch('/students/:studentId', feedbackController.createFeedback);

// 피드백 조회
feedbackRouter.get('/students/:studentId', feedbackController.getFeedback);

export { feedbackRouter };
