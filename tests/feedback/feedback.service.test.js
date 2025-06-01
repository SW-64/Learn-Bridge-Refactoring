import { describe, it, expect, vi, beforeEach } from 'vitest';
import FeedbackService from '../../src/services/feedback.service.js';
import { sendEmail } from '../../src/utils/send-email.util.js';

vi.mock('../../src/utils/send-email.util.js', () => ({
  sendEmail: vi.fn().mockResolvedValue(),
}));

describe('FeedbackService - createFeedback()', () => {
  let service;

  beforeEach(() => {
    service = new FeedbackService();
    service.feedbackRepository = {
      getFeedbackDetail: vi.fn(),
      createFeedback: vi.fn(),
    };
    service.studentRepository = {
      getOneStudent: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it('should throw BadRequestError if feedback category is missing or invalid', async () => {
    const feedback = [{ category: 'INVALID' }];
    await expect(service.createFeedback(1, feedback, 2024)).rejects.toThrow(
      '카테고리가 없거나 유효하지 않은 카테고리입니다',
    );
  });

  it('should throw BadRequestError if feedback already exists', async () => {
    const feedback = [{ category: 'BEHAVIOR' }];
    service.feedbackRepository.getFeedbackDetail.mockResolvedValue(true);

    await expect(service.createFeedback(1, feedback, 2024)).rejects.toThrow(
      '이미 존재하는 피드백입니다',
    );
  });

  it('should throw NotFoundError if required values are missing', async () => {
    await expect(service.createFeedback(null, null, null)).rejects.toThrow(
      'feedback is not iterable',
    );
  });

  it('should throw NotFoundError if student does not exist', async () => {
    service.feedbackRepository.getFeedbackDetail.mockResolvedValue(false);
    service.studentRepository.getOneStudent.mockResolvedValue(null);

    const feedback = [{ category: 'BEHAVIOR' }];
    await expect(service.createFeedback(1, feedback, 2024)).rejects.toThrow(
      '해당 학생이 존재하지 않습니다.',
    );
  });

  it('should create feedback and send email if valid', async () => {
    const feedback = [{ category: 'BEHAVIOR' }];
    const student = {
      user: { id: 5, email: 'test@student.com', name: '홍길동' },
    };

    service.feedbackRepository.getFeedbackDetail.mockResolvedValue(false);
    service.studentRepository.getOneStudent.mockResolvedValue(student);
    service.feedbackRepository.createFeedback.mockResolvedValue({
      success: true,
    });

    const result = await service.createFeedback(1, feedback, 2024);

    expect(service.feedbackRepository.createFeedback).toHaveBeenCalledWith(
      1,
      feedback,
      2024,
      5,
    );
    expect(sendEmail).toHaveBeenCalledWith(
      'test@student.com',
      '[피드백 알림] 피드백 입력이 완료되었습니다.',
      expect.stringContaining(
        '홍길동님의 2024학년 피드백 입력이 완료되었습니다.',
      ),
    );
    expect(result).toEqual({ success: true });
  });

  describe('FeedbackService - updateFeedback()', () => {
    let service;

    beforeEach(() => {
      service = new FeedbackService();
      service.feedbackRepository = {
        updateFeedback: vi.fn(),
      };
      service.studentRepository = {
        getOneStudent: vi.fn(),
      };
      vi.clearAllMocks();
    });

    it('should throw BadRequestError if category is missing or invalid', async () => {
      const invalidFeedback = [{ category: 'WRONG', updatedAt: '2025-06-01' }];
      await expect(
        service.updateFeedback(1, invalidFeedback, 2024),
      ).rejects.toThrow('카테고리가 없거나 유효하지 않은 카테고리입니다');
    });

    it('should throw BadRequestError if updatedAt is missing', async () => {
      const feedback = [{ category: 'BEHAVIOR' }];
      await expect(service.updateFeedback(1, feedback, 2024)).rejects.toThrow(
        '업데이트 날짜가 없습니다',
      );
    });

    it('should throw NotFoundError if required values are missing', async () => {
      await expect(service.updateFeedback(null, null, null)).rejects.toThrow(
        'feedback is not iterable',
      );
    });

    it('should throw NotFoundError if student does not exist', async () => {
      const feedback = [{ category: 'BEHAVIOR', updatedAt: '2025-06-01' }];
      service.studentRepository.getOneStudent.mockResolvedValue(null);

      await expect(service.updateFeedback(1, feedback, 2024)).rejects.toThrow(
        '해당 학생이 존재하지 않습니다.',
      );
    });

    it('should update feedback if all data is valid', async () => {
      const student = { user: { id: 7 } };
      const feedback = [{ category: 'BEHAVIOR', updatedAt: '2025-06-01' }];

      service.studentRepository.getOneStudent.mockResolvedValue(student);
      service.feedbackRepository.updateFeedback.mockResolvedValue({
        updated: true,
      });

      const result = await service.updateFeedback(1, feedback, 2024);

      expect(service.feedbackRepository.updateFeedback).toHaveBeenCalledWith(
        1,
        feedback,
        2024,
        7,
      );
      expect(result).toEqual({ updated: true });
    });
  });

  describe('FeedbackService - getFeedback()', () => {
    let service;

    beforeEach(() => {
      service = new FeedbackService();
      service.feedbackRepository = {
        getFeedback: vi.fn(),
      };
      service.studentRepository = {
        getOneStudent: vi.fn(),
      };
      vi.clearAllMocks();
    });

    it('should throw NotFoundError if schoolYear is missing', async () => {
      await expect(service.getFeedback(1, null)).rejects.toThrow(
        '과목을 입력해주세요',
      );
    });

    it('should throw Error if student does not exist', async () => {
      service.studentRepository.getOneStudent.mockResolvedValue(null);

      await expect(service.getFeedback(1, 2024)).rejects.toThrow(
        '해당 학생이 존재하지 않습니다.',
      );
    });

    it('should return feedback if inputs are valid', async () => {
      service.studentRepository.getOneStudent.mockResolvedValue({ id: 1 });
      service.feedbackRepository.getFeedback.mockResolvedValue(['피드백1']);

      const result = await service.getFeedback(1, 2024);
      expect(result).toEqual(['피드백1']);
      expect(service.feedbackRepository.getFeedback).toHaveBeenCalledWith(
        2024,
        1,
      );
    });
  });

  describe('FeedbackService - getMyFeedback()', () => {
    let service;

    beforeEach(() => {
      service = new FeedbackService();
      service.studentRepository = {
        getStudentByUserId: vi.fn(),
      };
      service.feedbackRepository = {
        getMyFeedback: vi.fn(),
      };
      vi.clearAllMocks();
    });

    it('should throw NotFoundError if required data is missing', async () => {
      await expect(service.getMyFeedback(null, null)).rejects.toThrow(
        '값을 불러오지 못했습니다.',
      );
    });

    it('should throw NotFoundError if student not found', async () => {
      service.studentRepository.getStudentByUserId.mockResolvedValue(null);

      await expect(service.getMyFeedback(1, 2024)).rejects.toThrow(
        '해당 학생이 존재하지 않습니다.',
      );
    });

    it('should return feedback if student exists', async () => {
      service.studentRepository.getStudentByUserId.mockResolvedValue({
        studentId: 5,
      });
      service.feedbackRepository.getMyFeedback.mockResolvedValue([
        'MY_FEEDBACK',
      ]);

      const result = await service.getMyFeedback(1, 2024);
      expect(result).toEqual(['MY_FEEDBACK']);
      expect(service.feedbackRepository.getMyFeedback).toHaveBeenCalledWith(
        5,
        2024,
      );
    });
  });

  describe('FeedbackService - getChildFeedback()', () => {
    let service;

    beforeEach(() => {
      service = new FeedbackService();
      service.parentRepository = {
        getParentsByUserId: vi.fn(),
      };
      service.studentRepository = {
        getStudentByParentId: vi.fn(),
      };
      service.feedbackRepository = {
        getMyFeedback: vi.fn(),
      };
      vi.clearAllMocks();
    });

    it('should throw NotFoundError if required data is missing', async () => {
      await expect(service.getChildFeedback(null, null)).rejects.toThrow(
        '값을 불러오지 못했습니다.',
      );
    });

    it('should throw NotFoundError if parent not found', async () => {
      service.parentRepository.getParentsByUserId.mockResolvedValue(null);

      await expect(service.getChildFeedback(2024, 1)).rejects.toThrow(
        '해당 학부모가 존재하지 않습니다.',
      );
    });

    it('should throw NotFoundError if student not found', async () => {
      service.parentRepository.getParentsByUserId.mockResolvedValue({
        parentsId: 99,
      });
      service.studentRepository.getStudentByParentId.mockResolvedValue(null);

      await expect(service.getChildFeedback(2024, 1)).rejects.toThrow(
        '해당 학생이 존재하지 않습니다.',
      );
    });

    it('should return child feedback if all valid', async () => {
      service.parentRepository.getParentsByUserId.mockResolvedValue({
        parentsId: 99,
      });
      service.studentRepository.getStudentByParentId.mockResolvedValue({
        studentId: 55,
      });
      service.feedbackRepository.getMyFeedback.mockResolvedValue([
        'CHILD_FEEDBACK',
      ]);

      const result = await service.getChildFeedback(2024, 1);
      expect(result).toEqual(['CHILD_FEEDBACK']);
      expect(service.feedbackRepository.getMyFeedback).toHaveBeenCalledWith(
        55,
        2024,
      );
    });
  });
});
