import express from 'express';
import FeedbackRepository from '../repositories/feedback.repository.js';
import { prisma } from '../utils/prisma.utils.js';
import FeedbackService from '../services/feedback.service.js';
import FeedbackController from '../controllers/feedback.controller.js';

const feedbackRouter = express.Router();
const feedbackRepository = new FeedbackRepository(prisma);
const feedbackService = new FeedbackService(feedbackRepository);
const feedbackController = new FeedbackController(feedbackService);

export { feedbackRouter };
