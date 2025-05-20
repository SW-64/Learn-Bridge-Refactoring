import express from 'express';
import FeedbackRepository from '../repositories/feedback.repository.js';
import { prisma } from '../utils/prisma.utils.js';
import FeedbackService from '../services/feedback.service.js';
import FeedbackController from '../controllers/feedback.controller.js';
import { requireAccessToken } from '../middlewares/require-access-token.middleware.js';
import { verifySchoolUser } from '../middlewares/verify-school-user.middleware.js';

const feedbackRouter = express.Router({ mergeParams: true });
const feedbackRepository = new FeedbackRepository(prisma);
const feedbackService = new FeedbackService(feedbackRepository);
const feedbackController = new FeedbackController(feedbackService);

// 피드백 작성
feedbackRouter.post(
  '/students/:studentId',
  requireAccessToken('TEACHER'),
  verifySchoolUser,
  feedbackController.createFeedback,
);

// 피드백 수정
feedbackRouter.patch(
  '/students/:studentId',
  requireAccessToken('TEACHER'),
  verifySchoolUser,
  feedbackController.updateFeedback,
);

// 피드백 조회
feedbackRouter.get(
  '/students/:studentId',
  //requireAccessToken(''),
  //verifySchoolUser, auth 가 필요없기에 verify 코드도 필요가 없어진다
  feedbackController.getFeedback,
);

// 피드백 조회 ( 학생 / 학부모 )
feedbackRouter.get(
  '/me',
  requireAccessToken('STUDENT'),
  verifySchoolUser,
  feedbackController.getMyFeedback,
);

export { feedbackRouter };
