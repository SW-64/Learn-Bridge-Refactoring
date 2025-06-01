import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConsultationService from '../../src/services/consultation.service.js';

// 선택적으로 이메일 유틸 mock
import * as emailUtil from '../../src/utils/send-email.util.js';

describe('ConsultationService', () => {
  let authService;

  beforeEach(() => {
    authService = new ConsultationService();
  });

  describe('createConsultation()', () => {
    beforeEach(() => {
      authService = new ConsultationService();

      authService.consultationRepository = {
        findExistedConsultation: vi.fn(),
        create: vi.fn(),
      };

      authService.teacherRepository = {
        findTeacherByUserId: vi.fn(),
      };

      authService.studentRepository = {
        getOneStudent: vi.fn(),
      };

      vi.spyOn(console, 'error').mockImplementation(() => {}); // 이메일 전송 실패 무시
    });

    it('should throw BadRequestError if any required field is missing', async () => {
      await expect(
        authService.createConsultation(null, '', '', '', true, 1, 1),
      ).rejects.toThrow('요청 값이 제대로 들어오지 않았습니다.');
    });

    it('should throw BadRequestError if nextPlan is earlier than date', async () => {
      await expect(
        authService.createConsultation(
          '제목',
          '내용',
          '2025-06-10',
          '2025-06-01',
          true,
          1,
          1,
        ),
      ).rejects.toThrow('상담일은 예정일보다 이전이어야 합니다.');
    });

    it('should throw BadRequestError if consultation already exists', async () => {
      authService.consultationRepository.findExistedConsultation.mockResolvedValue(
        true,
      );

      await expect(
        authService.createConsultation(
          '제목',
          '내용',
          '2025-06-10',
          '2025-06-11',
          true,
          1,
          1,
        ),
      ).rejects.toThrow('이미 존재하는 상담글입니다.');
    });

    it('should throw NotFoundError if student not found', async () => {
      authService.consultationRepository.findExistedConsultation.mockResolvedValue(
        false,
      );
      authService.teacherRepository.findTeacherByUserId.mockResolvedValue({
        subject: '국어',
        teacherId: 10,
        user: { name: '김선생' },
      });
      authService.studentRepository.getOneStudent.mockResolvedValue(null);

      await expect(
        authService.createConsultation(
          '제목',
          '내용',
          '2025-06-10',
          '2025-06-11',
          true,
          1,
          1,
        ),
      ).rejects.toThrow('해당 학생이 존재하지 않습니다.');
    });

    it('should create consultation and return result', async () => {
      authService.consultationRepository.findExistedConsultation.mockResolvedValue(
        false,
      );
      authService.teacherRepository.findTeacherByUserId.mockResolvedValue({
        subject: '수학',
        teacherId: 10,
        user: { name: '홍선생' },
      });
      authService.studentRepository.getOneStudent.mockResolvedValue({
        user: { id: 99, email: 'student@example.com', name: '홍길동' },
      });
      authService.consultationRepository.create.mockResolvedValue({
        success: true,
      });

      const result = await authService.createConsultation(
        '제목',
        '내용',
        '2025-06-10',
        '2025-06-11',
        true,
        1,
        1,
      );

      expect(authService.consultationRepository.create).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });

  describe('getAllConsultation()', () => {
    beforeEach(() => {
      authService = new ConsultationService();
      authService.studentRepository = {
        getOneStudent: vi.fn(),
      };
      authService.consultationRepository = {
        getAllConsultation: vi.fn(),
      };
    });

    it('should throw NotFoundError if student not found', async () => {
      authService.studentRepository.getOneStudent.mockResolvedValue(null);

      await expect(authService.getAllConsultation(1)).rejects.toThrow(
        '해당 학생이 존재하지 않습니다.',
      );
    });

    it('should return consultations if student exists', async () => {
      authService.studentRepository.getOneStudent.mockResolvedValue({ id: 1 });
      authService.consultationRepository.getAllConsultation.mockResolvedValue([
        '상담1',
        '상담2',
      ]);

      const result = await authService.getAllConsultation(1);
      expect(result).toEqual(['상담1', '상담2']);
    });
  });

  describe('getConsultationContent()', () => {
    beforeEach(() => {
      authService = new ConsultationService();
      authService.studentRepository = {
        getOneStudent: vi.fn(),
      };
      authService.consultationRepository = {
        getConsultationContent: vi.fn(),
      };
    });

    it('should throw NotFoundError if student not found', async () => {
      authService.studentRepository.getOneStudent.mockResolvedValue(null);

      await expect(authService.getConsultationContent(1, 100)).rejects.toThrow(
        '해당 학생이 존재하지 않습니다.',
      );
    });

    it('should return consultation content if student exists', async () => {
      authService.studentRepository.getOneStudent.mockResolvedValue({ id: 1 });
      authService.consultationRepository.getConsultationContent.mockResolvedValue(
        { title: '상담 제목' },
      );

      const result = await authService.getConsultationContent(1, 100);
      expect(result).toEqual({ title: '상담 제목' });
    });
  });

  describe('getConsultation()', () => {
    beforeEach(() => {
      authService = new ConsultationService();
      authService.studentRepository = {
        getOneStudent: vi.fn(),
      };
      authService.consultationRepository = {
        getConsultationByDate: vi.fn(),
        getConsultationBySubject: vi.fn(),
        getConsultationByTitle: vi.fn(),
        getConsultationByAuthor: vi.fn(),
      };
    });

    it('should throw NotFoundError if student not found', async () => {
      authService.studentRepository.getOneStudent.mockResolvedValue(null);

      await expect(
        authService.getConsultation('2025-06-01', null, null, null, 1),
      ).rejects.toThrow('해당 학생이 존재하지 않습니다.');
    });

    it('should return by date if date is given', async () => {
      authService.studentRepository.getOneStudent.mockResolvedValue({ id: 1 });
      authService.consultationRepository.getConsultationByDate.mockResolvedValue(
        ['date 결과'],
      );

      const result = await authService.getConsultation(
        '2025-06-01',
        null,
        null,
        null,
        1,
      );
      expect(result).toEqual(['date 결과']);
    });

    it('should return by subject if subject is given', async () => {
      authService.studentRepository.getOneStudent.mockResolvedValue({ id: 1 });
      authService.consultationRepository.getConsultationBySubject.mockResolvedValue(
        ['subject 결과'],
      );

      const result = await authService.getConsultation(
        null,
        '국어',
        null,
        null,
        1,
      );
      expect(result).toEqual(['subject 결과']);
    });

    it('should return by title if title is given', async () => {
      authService.studentRepository.getOneStudent.mockResolvedValue({ id: 1 });
      authService.consultationRepository.getConsultationByTitle.mockResolvedValue(
        ['title 결과'],
      );

      const result = await authService.getConsultation(
        null,
        null,
        '타이틀',
        null,
        1,
      );
      expect(result).toEqual(['title 결과']);
    });

    it('should return by author if author is given', async () => {
      authService.studentRepository.getOneStudent.mockResolvedValue({ id: 1 });
      authService.consultationRepository.getConsultationByAuthor.mockResolvedValue(
        ['author 결과'],
      );

      const result = await authService.getConsultation(
        null,
        null,
        null,
        '홍길동',
        1,
      );
      expect(result).toEqual(['author 결과']);
    });
  });
});
