import express from 'express';
import AuthRepository from '../repositories/auth.repository.js';
import { prisma } from '../utils/prisma.utils.js';
import AuthService from '../services/auth.service.js';
import AuthController from '../controllers/auth.controller.js';

const authRouter = express.Router();
const authRepository = new AuthRepository(prisma);
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

export { authRouter };
