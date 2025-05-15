import express from 'express';
import EmailService from '../services/email.service.js';
import EmailController from '../controllers/email.controller.js';
import EmailRepository from '../repositories/email.repository.js';
import { prisma } from '../utils/prisma.utils.js';

const emailRouter = express.Router({ mergeParams: true });
const emailRepository = new EmailRepository(prisma);
const emailService = new EmailService(emailRepository);
const emailController = new EmailController(emailService);

// 인증 코드 확인
emailRouter.post('/find-password', emailController.findMyPassword);

// 인증 코드 발송
emailRouter.post('/code', emailController.sendFindMyPasswordCode);

// 새 비밀번호 설정
emailRouter.patch('/new-password', emailController.setNewPassword);

export { emailRouter };
