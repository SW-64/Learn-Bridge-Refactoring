import express from 'express';
import NotificationRepository from '../repositories/notification.repository.js';
import { prisma } from '../utils/prisma.utils.js';
import NotificationService from '../services/notification.service.js';
import NotificationController from '../controllers/notification.controller.js';
import { verifySchoolUser } from '../middlewares/verify-school-user.middleware.js';
import { requireAccessToken } from '../middlewares/require-access-token.middleware.js';

const notificationRouter = express.Router({ mergeParams: true });
const notificationRepository = new NotificationRepository(prisma);
const notificationService = new NotificationService(notificationRepository);
const notificationController = new NotificationController(notificationService);

// 알림 전체 내역 조회
notificationRouter.get(
  '/',
  requireAccessToken(''),
  verifySchoolUser,
  notificationController.getAllNotification,
);
// 알림 상세 내역 조회
notificationRouter.get(
  '/:notificationId',
  requireAccessToken(''),
  verifySchoolUser,
  notificationController.getOneNotification,
);

export { notificationRouter };
