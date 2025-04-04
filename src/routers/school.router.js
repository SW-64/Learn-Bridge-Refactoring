import SchoolRepository from '../repositories/school.repository.js';
import { prisma } from '../utils/prisma.utils.js';

const schoolRepository = new SchoolRepository(prisma);
