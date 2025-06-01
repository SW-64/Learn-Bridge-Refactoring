import { describe, it, beforeEach, expect, vi } from 'vitest';
import UserService from '../../src/services/user.service.js';
import {
  NotFoundError,
  UnauthorizedError,
} from '../../src/errors/http.error.js';
import { prisma } from '../../src/utils/prisma.utils.js';

// bcrypt mocking은 반드시 위에서 정의 & 내부에 직접 선언
vi.mock('bcrypt', () => ({
  default: {
    compareSync: vi.fn(() => true), // default로 true 반환
    hashSync: vi.fn(() => 'hashedPassword'),
  },
}));

vi.mock('../../src/utils/redis.util.js', () => ({}));

describe('UserService', () => {
  let service;
  let bcrypt;

  beforeEach(async () => {
    service = new UserService();
    service.userRepository = {
      getUserById: vi.fn(),
      getUserPassword: vi.fn(),
      updateMyPassword: vi.fn(),
      updateMyInfo: vi.fn(),
    };
    service.classRepository = {
      getAllClasses: vi.fn(),
      findClassByClassId: vi.fn(),
      assignStudentsToClass: vi.fn(),
      removeStudentsFromClass: vi.fn(),
      resetHomeroomTeacher: vi.fn(),
      setNewHomeroomTeacher: vi.fn(),
      createClass: vi.fn(),
    };
    service.teacherRepository = {
      getAvailableTeachers: vi.fn(),
    };

    bcrypt = await import('bcrypt'); // 나중에 import해서 mocking 접근
    vi.clearAllMocks();
  });

  describe('getMyInfo()', () => {
    it('should return user if exists', async () => {
      const mockUser = { id: 1, name: '홍길동' };
      service.userRepository.getUserById.mockResolvedValue(mockUser);
      const result = await service.getMyInfo(1, 'TEACHER');
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      service.userRepository.getUserById.mockResolvedValue(null);
      await expect(service.getMyInfo(1, 'STUDENT')).rejects.toThrow(
        '유저를 찾을 수 없습니다.',
      );
    });
  });

  describe('updateMyPassword()', () => {
    it('should throw if user not found', async () => {
      service.userRepository.getUserPassword.mockResolvedValue(null);
      await expect(service.updateMyPassword(1, '1234', 'abcd')).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should throw if current password is wrong', async () => {
      bcrypt.default.compareSync.mockReturnValue(false); // 여기서 default로 접근
      service.userRepository.getUserPassword.mockResolvedValue({
        password: 'hashed',
      });

      await expect(
        service.updateMyPassword(1, 'wrong', 'newpass'),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should update password if all valid', async () => {
      bcrypt.default.compareSync.mockReturnValue(true); // 정상 비교
      service.userRepository.getUserPassword.mockResolvedValue({
        password: 'hashed',
      });
      service.userRepository.updateMyPassword.mockResolvedValue(true);

      await expect(
        service.updateMyPassword(1, 'correct', 'newpass'),
      ).resolves.toBeUndefined();
    });
  });

  describe('updateMyInfo()', () => {
    it('should update info if user exists', async () => {
      const user = { id: 1, name: '기존' };
      const updated = { id: 1, name: '수정됨' };

      service.userRepository.getUserById.mockResolvedValue(user);
      service.userRepository.updateMyInfo.mockResolvedValue(updated);

      const result = await service.updateMyInfo(1, { name: '수정됨' });
      expect(result).toEqual(updated);
    });

    it('should throw if user does not exist', async () => {
      service.userRepository.getUserById.mockResolvedValue(null);
      await expect(service.updateMyInfo(1, {})).rejects.toThrow(NotFoundError);
    });
  });

  describe('getClasses()', () => {
    it('should return classes for given schoolId', async () => {
      const mockClasses = [
        { classId: 1, grade: 1, gradeClass: 1 },
        { classId: 2, grade: 1, gradeClass: 2 },
      ];

      service.classRepository.getAllClasses.mockResolvedValue(mockClasses);

      const result = await service.getClasses(1); // 🔧 메서드 이름 수정

      expect(service.classRepository.getAllClasses).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockClasses);
    });
  });

  describe('createClasses()', () => {
    it('should call repository once with all classes', async () => {
      const mockInput = {
        grade1: 1, // 1학년 1개 반 생성 (gradeClass 1)
        grade2: 3, // 2학년 3개 반 생성 (gradeClass 1, 2, 3)
        grade3: 2, // 3학년 2개 반 생성 (gradeClass 1, 2)
        schoolId: 1,
      };

      const expectedPayload = [
        { grade: 1, gradeClass: 1, schoolId: 1 }, // 1학년 1반
        { grade: 2, gradeClass: 1, schoolId: 1 }, // 2학년 1반
        { grade: 2, gradeClass: 2, schoolId: 1 }, // 2학년 2반
        { grade: 2, gradeClass: 3, schoolId: 1 }, // 2학년 3반
        { grade: 3, gradeClass: 1, schoolId: 1 }, // 3학년 1반
        { grade: 3, gradeClass: 2, schoolId: 1 }, // 3학년 2반
      ];

      service.classRepository.createClass = vi.fn().mockResolvedValue(true);

      await service.createClasses(mockInput);

      expect(service.classRepository.createClass).toHaveBeenCalledTimes(1);
      expect(service.classRepository.createClass).toHaveBeenCalledWith(
        expect.arrayContaining(expectedPayload), // 배열이 예상값을 포함하는지 확인
      );
    });

    it('should call with empty array if all grades are zero', async () => {
      const mockInput = {
        grade1: 0, // 1학년 0개 반
        grade2: 0, // 2학년 0개 반
        grade3: 0, // 3학년 0개 반
        schoolId: 1,
      };

      service.classRepository.createClass = vi.fn().mockResolvedValue(true);

      await service.createClasses(mockInput);

      expect(service.classRepository.createClass).toHaveBeenCalledWith([]);
    });
  });

  describe('getHomeroomInfo()', () => {
    it('should return homeroom info with null values when class exists', async () => {
      const mockClassData = {
        classId: 1,
        grade: 2,
        gradeClass: 3,
        teacher: null, // 서비스 코드에서 teacher가 없는 경우
      };

      const mockNoClassData = []; // 담임이 없는 교사 목록 (빈 배열)

      service.classRepository.findClassByClassId = vi
        .fn()
        .mockResolvedValue(mockClassData);
      service.teacherRepository.getAvailableTeachers = vi
        .fn()
        .mockResolvedValue(mockNoClassData);

      const result = await service.getHomeroomInfo(1, 1); // classId와 schoolId 전달

      expect(result).toEqual({
        homeroom: null, // teacher가 null이므로 homeroom도 null
        notHomeroom: [], // 빈 배열 반환
      });
    });

    it('should return null values when no class found', async () => {
      service.classRepository.findClassByClassId = vi
        .fn()
        .mockResolvedValue(null);
      service.teacherRepository.getAvailableTeachers = vi
        .fn()
        .mockResolvedValue([]);

      const result = await service.getHomeroomInfo(999, 1); // 유효하지 않은 classId

      expect(result).toEqual({
        homeroom: null,
        notHomeroom: [],
      });
    });
  });

  describe('manageClassStudent()', () => {
    it('should assign students if addedStudentIds are provided', async () => {
      const input = {
        classId: 1,
        addedStudentIds: [101, 102],
        removedStudentIds: [],
      };

      const txMock = {}; // 트랜잭션 객체 모의
      service.classRepository.assignStudentsToClass = vi
        .fn()
        .mockResolvedValue(true);
      service.classRepository.removeStudentsFromClass = vi.fn();

      // prisma.$transaction을 직접 감싸기 위해 모의
      prisma.$transaction = vi.fn().mockImplementation(async (callback) => {
        await callback(txMock);
      });

      await service.manageClassStudent(input);

      expect(
        service.classRepository.assignStudentsToClass,
      ).toHaveBeenCalledWith(txMock, input.classId, input.addedStudentIds);
      expect(
        service.classRepository.removeStudentsFromClass,
      ).not.toHaveBeenCalled();
    });

    it('should remove students if removedStudentIds are provided', async () => {
      const input = {
        classId: 2,
        addedStudentIds: [],
        removedStudentIds: [201, 202],
      };

      const txMock = {};
      service.classRepository.assignStudentsToClass = vi.fn();
      service.classRepository.removeStudentsFromClass = vi
        .fn()
        .mockResolvedValue(true);

      prisma.$transaction = vi.fn().mockImplementation(async (callback) => {
        await callback(txMock);
      });

      await service.manageClassStudent(input);

      expect(
        service.classRepository.removeStudentsFromClass,
      ).toHaveBeenCalledWith(txMock, input.classId, input.removedStudentIds);
      expect(
        service.classRepository.assignStudentsToClass,
      ).not.toHaveBeenCalled();
    });

    it('should do nothing if both addedStudentIds and removedStudentIds are empty', async () => {
      const input = {
        classId: 3,
        addedStudentIds: [],
        removedStudentIds: [],
      };

      const txMock = {};
      service.classRepository.assignStudentsToClass = vi.fn();
      service.classRepository.removeStudentsFromClass = vi.fn();

      prisma.$transaction = vi.fn().mockImplementation(async (callback) => {
        await callback(txMock);
      });

      await service.manageClassStudent(input);

      expect(
        service.classRepository.assignStudentsToClass,
      ).not.toHaveBeenCalled();
      expect(
        service.classRepository.removeStudentsFromClass,
      ).not.toHaveBeenCalled();
    });
  });

  describe('manageClassTeacher()', () => {
    const txMock = {};

    beforeEach(() => {
      service.classRepository.resetHomeroomTeacher = vi
        .fn()
        .mockResolvedValue(true);
      service.classRepository.setNewHomeroomTeacher = vi
        .fn()
        .mockResolvedValue(true);
      vi.stubGlobal('prisma', {
        $transaction: vi.fn().mockImplementation(async (callback) => {
          return await callback(txMock);
        }),
      });
    });

    it('should assign teacher if newHomeroomTeacherId is provided', async () => {
      const classId = 1;
      const teacherId = 10;

      await service.manageClassTeacher({
        classId,
        newHomeroomTeacherId: teacherId,
      });

      expect(service.classRepository.resetHomeroomTeacher).toHaveBeenCalledWith(
        txMock,
        classId,
      );
      expect(
        service.classRepository.setNewHomeroomTeacher,
      ).toHaveBeenCalledWith(txMock, classId, teacherId);
    });

    it('should only reset if newHomeroomTeacherId is null', async () => {
      const classId = 1;

      await service.manageClassTeacher({ classId, newHomeroomTeacherId: null });

      expect(service.classRepository.resetHomeroomTeacher).toHaveBeenCalledWith(
        txMock,
        classId,
      );
      expect(
        service.classRepository.setNewHomeroomTeacher,
      ).not.toHaveBeenCalled();
    });
  });
});
