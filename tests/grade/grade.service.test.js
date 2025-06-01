import { describe, it, expect, vi, beforeEach } from 'vitest';
import GradesService from '../../src/services/grades.service.js';
import { sendEmail } from '../../src/utils/send-email.util.js';
import { encrypt } from '../../src/utils/crypto.util.js';

import emailQueue from '../../src/queues/email.queue.js';

vi.mock('../../src/queues/email.queue.js', () => ({
  default: { add: vi.fn().mockResolvedValue() },
}));

vi.mock('../../src/utils/crypto.util.js', () => ({
  encrypt: vi.fn().mockReturnValue({ iv: 'iv123', content: 'enc123' }),
  decrypt: vi.fn().mockReturnValue(95), // 복호화 mock
}));

describe('GradesService - createGrades()', () => {
  let service;

  beforeEach(() => {
    service = new GradesService();
    service.gradeRepository = {
      getGradesByPeriodAndSubject: vi.fn(),
      createGrades: vi.fn(),
    };
    service.studentRepository = {
      getOneStudent: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it('should throw NotFoundError if any field is missing', async () => {
    const invalid = [{ subject: '수학', score: 100 }];
    await expect(service.createGrades(invalid)).rejects.toThrow(
      '값을 불러오지 못했습니다.',
    );
  });

  it('should throw ConflictError if grade already exists', async () => {
    const input = [
      {
        schoolYear: 2024,
        semester: 1,
        subject: '수학',
        score: 95,
        studentId: 1,
      },
    ];
    service.gradeRepository.getGradesByPeriodAndSubject.mockResolvedValue(true);

    await expect(service.createGrades(input)).rejects.toThrow(
      '이미 존재하는 성적입니다',
    );
  });

  it('should create encrypted grade and queue email if valid', async () => {
    const input = [
      {
        schoolYear: 2024,
        semester: 1,
        subject: '수학',
        score: 95,
        studentId: 1,
      },
    ];

    const student = {
      user: { id: 99, email: 'test.com', name: '홍길동' },
    };

    service.gradeRepository.getGradesByPeriodAndSubject.mockResolvedValue(null);
    service.studentRepository.getOneStudent.mockResolvedValue(student);
    service.gradeRepository.createGrades.mockResolvedValue({ done: true });

    const result = await service.createGrades(input);

    expect(encrypt).toHaveBeenCalledWith(95);
    expect(service.gradeRepository.createGrades).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          scoreIv: 'iv123',
          scoreContent: 'enc123',
        }),
      ]),
      99,
    );

    expect(emailQueue.add).toHaveBeenCalledWith({
      to: 'test.com',
      subject: expect.stringContaining('[성적 알림]'),
      html: expect.stringContaining('성적 입력이 완료'),
    });

    expect(result).toEqual({ done: true });
  });

  it('should create encrypted grade and send email if valid', async () => {
    const input = [
      {
        schoolYear: 2024,
        semester: 1,
        subject: '수학',
        score: 95,
        studentId: 1,
      },
    ];

    const student = {
      user: { id: 99, email: 'test.com', name: '홍길동' },
    };

    service.gradeRepository.getGradesByPeriodAndSubject.mockResolvedValue(null);
    service.studentRepository.getOneStudent.mockResolvedValue(student);
    service.gradeRepository.createGrades.mockResolvedValue({ done: true });

    const result = await service.createGrades(input);

    expect(encrypt).toHaveBeenCalledWith(95);
    expect(service.gradeRepository.createGrades).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          scoreIv: 'iv123',
          scoreContent: 'enc123',
        }),
      ]),
      99,
    );
    expect(emailQueue.add).toHaveBeenCalledWith({
      to: 'test.com',
      subject: expect.stringContaining('[성적 알림]'),
      html: expect.stringContaining('성적 입력이 완료'),
    });
    expect(result).toEqual({ done: true });
  });
});

describe('GradesService - getGrades()', () => {
  let service;

  beforeEach(() => {
    service = new GradesService();
    service.studentRepository = {
      getOneStudent: vi.fn(),
    };
    service.gradeRepository = {
      getGrades: vi.fn(),
      getGradesByPeriod: vi.fn(),
      getGradesBySubject: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it('should throw NotFoundError if required data is missing', async () => {
    await expect(service.getGrades(null, null)).rejects.toThrow(
      '과목 or ( 학년, 학기 ) 중 하나의 값을 입력해주세요',
    );
  });

  it('should throw NotFoundError if student not found', async () => {
    service.studentRepository.getOneStudent.mockResolvedValue(null);

    await expect(service.getGrades(1, 2024)).rejects.toThrow(
      '해당 학생이 존재하지 않습니다.',
    );
  });

  //   it('should return grades if student exists', async () => {
  //     service.studentRepository.getOneStudent.mockResolvedValue({ studentId: 1 });
  //     service.gradeRepository.getGradesByPeriod.mockResolvedValue([
  //       { scoreIv: 'iv1', scoreContent: 'enc1' },
  //       { scoreIv: 'iv2', scoreContent: 'enc2' },
  //     ]);

  //     const result = await service.getGrades(undefined, 2024, 1, 1);
  //     expect(result).toEqual([{ score: 95 }, { score: 95 }]);
  //     expect(service.gradeRepository.getGradesByPeriod).toHaveBeenCalledWith(
  //       2024,
  //       1,
  //       1,
  //     );
  //   });

  describe('GradesService - updateGrades()', () => {
    let service;

    beforeEach(() => {
      service = new GradesService();
      service.gradeRepository = {
        getGradesByPeriodAndSubject: vi.fn(),
        updateGrades: vi.fn(),
      };
      service.studentRepository = {
        getOneStudent: vi.fn(),
      };
      vi.clearAllMocks();
    });

    it('should throw NotFoundError if grade to update does not exist', async () => {
      const input = [
        {
          schoolYear: 2024,
          semester: 1,
          subject: '영어',
          score: 70,
          studentId: 1,
          updatedAt: new Date(),
        },
      ];

      service.gradeRepository.getGradesByPeriodAndSubject.mockResolvedValue(
        null,
      );

      await expect(service.updateGrades(input)).rejects.toThrow(
        '입력되지 않은 성적입니다.',
      );
    });

    it('should throw NotFoundError if any field is missing', async () => {
      const input = [
        {
          schoolYear: 2024,
          semester: 1,
          subject: '수학',
          score: 95,
          // studentId 누락
          updatedAt: new Date(),
        },
      ];

      await expect(service.updateGrades(input)).rejects.toThrow(
        '값을 불러오지 못했습니다.',
      );
    });

    it('should throw NotFoundError if grade does not exist', async () => {
      const input = [
        {
          schoolYear: 2024,
          semester: 1,
          subject: '수학',
          score: 95,
          studentId: 1,
          updatedAt: new Date(),
        },
      ];

      service.gradeRepository.getGradesByPeriodAndSubject.mockResolvedValue(
        null,
      );

      await expect(service.updateGrades(input)).rejects.toThrow(
        '입력되지 않은 성적입니다.: 수학, 2024, 1',
      );
    });

    it('should update encrypted grade if valid', async () => {
      const input = [
        {
          schoolYear: 2024,
          semester: 1,
          subject: '수학',
          score: 95,
          studentId: 1,
          updatedAt: new Date(),
        },
      ];

      const student = {
        user: { id: 99, email: 'test.com', name: '홍길동' },
      };

      service.gradeRepository.getGradesByPeriodAndSubject.mockResolvedValue(
        true,
      );
      service.studentRepository.getOneStudent.mockResolvedValue(student);
      service.gradeRepository.updateGrades.mockResolvedValue({ done: true });

      const result = await service.updateGrades(input);

      expect(encrypt).toHaveBeenCalledWith(95);
      expect(service.gradeRepository.updateGrades).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            scoreIv: 'iv123',
            scoreContent: 'enc123',
          }),
        ]),
        99,
      );
      expect(result).toEqual({ done: true });
    });
  });

  describe('GradesService - getClassGrades()', () => {
    let service;

    beforeEach(() => {
      service = new GradesService();
      service.gradeRepository = {
        getClassGrades: vi.fn(),
      };
      vi.clearAllMocks();
    });

    it('should throw NotFoundError if classId or semester is missing', async () => {
      await expect(service.getClassGrades(null, 1)).rejects.toThrow(
        '반 ID와 학기를 입력해주세요.',
      );

      await expect(service.getClassGrades(2, null)).rejects.toThrow(
        '반 ID와 학기를 입력해주세요.',
      );
    });

    it('should return decrypted grades if input is valid', async () => {
      service.gradeRepository.getClassGrades.mockResolvedValue([
        { scoreIv: 'iv123', scoreContent: 'enc123' },
      ]);

      const result = await service.getClassGrades(2, 1);

      expect(result).toEqual([{ score: 95 }]); // decrypt mock이 항상 95 반환함
      expect(service.gradeRepository.getClassGrades).toHaveBeenCalledWith(2, 1);
    });
  });
});
