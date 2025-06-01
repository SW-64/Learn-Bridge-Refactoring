import { vi } from 'vitest';
import StudentsService from '../../src/services/students.service.js';
import { NotFoundError } from '../../src/errors/http.error.js';

vi.mock('../../src/constants/message.constant.js', () => ({
  MESSAGES: {
    STUDENT: {
      COMMON: {
        NOT_FOUND: '해당 학생이 존재하지 않습니다.',
      },
    },
  },
}));

describe('StudentsService', () => {
  let service;

  beforeEach(() => {
    service = new StudentsService();
    service.studentsRepository = {
      getClassStudent: vi.fn(),
      getNoClassStudent: vi.fn(),
      getOneStudent: vi.fn(),
      updateOneStudent: vi.fn(),
      deleteOneStudent: vi.fn(),
      searchStudent: vi.fn(),
    };
    service.classRepository = {
      findClassByGradeAndClass: vi.fn(),
    };
    vi.clearAllMocks();
  });

  describe('getClassStudent()', () => {
    it('should return class students', async () => {
      const mockResult = [{ name: 'John' }];
      service.studentsRepository.getClassStudent.mockResolvedValue(mockResult);
      const result = await service.getClassStudent(1, 10);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getNoClassStudent()', () => {
    it('should return students without class', async () => {
      const mockResult = [{ name: 'Jane' }];
      service.studentsRepository.getNoClassStudent.mockResolvedValue(
        mockResult,
      );
      const result = await service.getNoClassStudent(1, 10);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getOneStudent()', () => {
    it('should return student if exists', async () => {
      const mockStudent = { studentId: 1 };
      service.studentsRepository.getOneStudent.mockResolvedValue(mockStudent);
      const result = await service.getOneStudent(1);
      expect(result).toEqual(mockStudent);
    });

    it('should throw NotFoundError if student does not exist', async () => {
      service.studentsRepository.getOneStudent.mockResolvedValue(null);
      await expect(service.getOneStudent(1)).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateOneStudent()', () => {
    it('should update student if valid', async () => {
      const mockStudent = { studentId: 1 };
      const mockClass = { classId: 2 };
      const mockUpdated = { updated: true };

      service.studentsRepository.getOneStudent.mockResolvedValue(mockStudent);
      service.classRepository.findClassByGradeAndClass.mockResolvedValue(
        mockClass,
      );
      service.studentsRepository.updateOneStudent.mockResolvedValue(
        mockUpdated,
      );

      const result = await service.updateOneStudent(1, 'Kim', 2, 3, 10, 99);
      expect(result).toEqual(mockUpdated);
    });

    it('should throw if student not found', async () => {
      service.studentsRepository.getOneStudent.mockResolvedValue(null);
      await expect(
        service.updateOneStudent(1, 'Kim', 2, 3, 10, 99),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw if class not found', async () => {
      service.studentsRepository.getOneStudent.mockResolvedValue({
        studentId: 1,
      });
      service.classRepository.findClassByGradeAndClass.mockResolvedValue(null);
      await expect(
        service.updateOneStudent(1, 'Kim', 2, 3, 10, 99),
      ).rejects.toThrow('해당 반이 존재하지 않습니다.');
    });
  });

  describe('deleteOneStudent()', () => {
    it('should delete student if exists', async () => {
      const mockStudent = { studentId: 1 };
      const mockDeleted = { deleted: true };

      service.studentsRepository.getOneStudent.mockResolvedValue(mockStudent);
      service.studentsRepository.deleteOneStudent.mockResolvedValue(
        mockDeleted,
      );

      const result = await service.deleteOneStudent(1);
      expect(result).toEqual(mockDeleted);
    });

    it('should throw if student not found', async () => {
      service.studentsRepository.getOneStudent.mockResolvedValue(null);
      await expect(service.deleteOneStudent(1)).rejects.toThrow(NotFoundError);
    });
  });

  describe('searchStudent()', () => {
    it('should return student if found', async () => {
      const mockStudent = { studentId: 1 };
      service.studentsRepository.searchStudent.mockResolvedValue(mockStudent);
      const result = await service.searchStudent('홍길동', 1);
      expect(result).toEqual(mockStudent);
    });

    it('should throw if student not found', async () => {
      service.studentsRepository.searchStudent.mockResolvedValue(null);
      await expect(service.searchStudent('홍길동', 1)).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
