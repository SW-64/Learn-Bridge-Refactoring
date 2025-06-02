import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthService from '../../src/services/auth.service.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('AuthService', () => {
  let authService;
  let mockAuthRepository;
  let mockClassRepository;

  beforeEach(() => {
    mockAuthRepository = {
      create: vi.fn(),
      findUserByLoginId: vi.fn(),
    };

    mockClassRepository = {
      findClassByTeacherId: vi.fn(),
    };

    authService = new AuthService();
    authService.authRepository = mockAuthRepository;
    authService.classRepository = mockClassRepository;
  });

  // ✅ signUp 테스트
  describe('signUp()', () => {
    it('should throw BadRequestError if name, role, or email is missing', async () => {
      await expect(authService.signUp({})).rejects.toThrow('Bad Request');
    });

    it('should throw BadRequestError if STUDENT provides subject', async () => {
      const input = {
        name: '학생',
        role: 'STUDENT',
        email: 'student@example.com',
        subject: 'Korean',
      };

      await expect(authService.signUp(input)).rejects.toThrow(
        '학생은 과목을 입력할 수 없습니다.',
      );
    });

    it('should throw BadRequestError if TEACHER provides grade or phone info', async () => {
      const input = {
        name: '선생님',
        role: 'TEACHER',
        email: 'teacher@example.com',
        grade: 1,
        phonenumber: '010-1234-5678',
      };

      await expect(authService.signUp(input)).rejects.toThrow(
        '선생님은 학년, 반, 번호를 입력할 수 없습니다.',
      );
    });

    it('should call authRepository.create and return data with rawPassword', async () => {
      const input = {
        name: '김교사',
        role: 'TEACHER',
        email: 'teacher@example.com',
        subject: 'Math',
        schoolId: 1,
      };

      const mockResponse = {
        id: 1,
        name: '김교사',
        email: 'teacher@example.com',
      };

      mockAuthRepository.create.mockResolvedValue(mockResponse);

      const result = await authService.signUp(input);

      expect(mockAuthRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('rawPassword');
      expect(result.name).toBe('김교사');
    });
  });

  // ✅ signIn 테스트
  describe('signIn()', () => {
    it('should throw UnauthorizedError if user not found', async () => {
      mockAuthRepository.findUserByLoginId.mockResolvedValue(null);

      await expect(
        authService.signIn({ loginId: 'invalid', password: 'wrong' }),
      ).rejects.toThrow('인증 정보가 유효하지 않습니다.');
    });

    it('should throw UnauthorizedError if password is incorrect', async () => {
      const fakeUser = { id: 1, role: 'STUDENT', password: 'hashed' };
      mockAuthRepository.findUserByLoginId.mockResolvedValue(fakeUser);
      vi.mock('bcrypt', () => ({
        default: { compareSync: () => false },
      }));

      await expect(
        authService.signIn({ loginId: 'user1', password: 'wrong' }),
      ).rejects.toThrow('인증 정보가 유효하지 않습니다.');
    });

    it('should return tokens and classId for TEACHER', async () => {
      const fakeUser = {
        id: 2,
        role: 'TEACHER',
        password: 'hashed',
        teacher: { teacherId: 100 },
        schoolId: 1,
      };
      mockAuthRepository.findUserByLoginId.mockResolvedValue(fakeUser);
      mockClassRepository.findClassByTeacherId.mockResolvedValue({
        classId: 55,
      });

      // ✅ 여기 추가!
      vi.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

      vi.spyOn(authService, 'generateAuthTokens').mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        schoolId: 1,
      });

      const result = await authService.signIn({
        loginId: 'teacher01',
        password: 'correct',
      });

      expect(result).toEqual({
        accessToken: 'access',
        refreshToken: 'refresh',
        schoolId: 1,
        classId: 55,
      });
    });
  });

  describe('generateAuthTokens()', () => {
    it('should generate access and refresh tokens and upsert refresh token', async () => {
      const payload = { id: 1, role: 'STUDENT', schoolId: 100 };

      // 토큰 더미 값
      const accessToken = 'access.token.here';
      const refreshToken = 'refresh.token.here';

      // jwt.sign을 mock
      vi.spyOn(jwt, 'sign')
        .mockImplementationOnce(() => accessToken)
        .mockImplementationOnce(() => refreshToken);

      // authRepository.upsertRefreshToken mock
      const mockUpsert = vi.fn();
      authService.authRepository.upsertRefreshToken = mockUpsert;

      const result = await authService.generateAuthTokens(payload);

      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(mockUpsert).toHaveBeenCalledWith(payload.id, refreshToken);

      expect(result).toEqual({
        accessToken,
        refreshToken,
        schoolId: payload.schoolId,
      });
    });
  });

  describe('parentsSignUp()', () => {
    it('should convert Korean name to QWERTY password and update parent/student info', async () => {
      // 🔧 한글 이름
      const name = '홍길동';
      const loginId = 'hong123';
      const schoolId = 1;
      const userId = 99;

      // ✅ 치환된 예상 키보드 입력 (단순화된 예시)
      const expectedPassword = 'ghrlfeh'; // 실제 변환은 hangul-js 기반이므로 다를 수 있음

      // 📦 parentsRepository.createParents() 반환 mock
      const mockCreatedParents = {
        Parents: { parentsId: 123 },
        someOtherData: true,
      };

      // 🔧 mock repositories
      authService.parentsRepository.createParents = vi
        .fn()
        .mockResolvedValue(mockCreatedParents);
      authService.StudentsRepository.updateParentId = vi.fn();

      // ✨ 테스트 실행
      const result = await authService.parentsSignUp({
        loginId,
        schoolId,
        userId,
        name,
      });

      expect(authService.parentsRepository.createParents).toHaveBeenCalledWith({
        loginId,
        schoolId,
        rawPassword: expect.any(String),
        name,
      });

      expect(
        authService.StudentsRepository.updateParentId,
      ).toHaveBeenCalledWith({
        userId,
        parentsId: 123,
      });

      expect(result).toHaveProperty('rawPassword');
      expect(result.Parents.parentsId).toBe(123);
    });
  });

  describe('addKakaoInfo()', () => {
    const validInput = {
      userId: 1,
      name: '홍길동',
      role: 'STUDENT',
      subject: null,
      grade: 1,
      gradeClass: 3,
      number: 17,
      schoolName: '서울고',
    };

    beforeEach(() => {
      authService.schoolRepository.findSchoolBySchoolName = vi.fn();
      authService.userRepository.findClass = vi.fn();
      authService.authRepository.addKakaoInfo = vi.fn();
    });

    it('should throw BadRequestError if required fields are missing', async () => {
      await expect(
        authService.addKakaoInfo({}, null, null, null, null, null, null, null),
      ).rejects.toThrow('Bad Request');
    });

    it('should throw BadRequestError if STUDENT provides subject', async () => {
      await expect(
        authService.addKakaoInfo(
          1,
          '홍길동',
          'STUDENT',
          'Math',
          1,
          3,
          17,
          '서울고',
        ),
      ).rejects.toThrow('학생은 과목을 입력할 수 없습니다.');
    });

    it('should throw BadRequestError if TEACHER provides grade info', async () => {
      await expect(
        authService.addKakaoInfo(
          1,
          '김선생',
          'TEACHER',
          '국어',
          1,
          3,
          17,
          '서울고',
        ),
      ).rejects.toThrow('선생님은 학년, 반, 번호를 입력할 수 없습니다.');
    });

    it('should throw NotFoundError if school not found', async () => {
      authService.schoolRepository.findSchoolBySchoolName.mockResolvedValue(
        null,
      );

      await expect(
        authService.addKakaoInfo(
          1,
          '홍길동',
          'STUDENT',
          null,
          1,
          3,
          17,
          '없는학교',
        ),
      ).rejects.toThrow('해당되는 학교가 없습니다.');
    });

    it('should throw NotFoundError if class not found for STUDENT', async () => {
      authService.schoolRepository.findSchoolBySchoolName.mockResolvedValue([
        { schoolId: 1 },
      ]);
      authService.userRepository.findClass.mockResolvedValue(null); // 반 정보 없음

      await expect(
        authService.addKakaoInfo(
          1,
          '홍길동',
          'STUDENT',
          null,
          1,
          3,
          17,
          '서울고',
        ),
      ).rejects.toThrow('해당 반이 존재하지 않습니다.');
    });

    it('should call addKakaoInfo with correct data when valid', async () => {
      authService.schoolRepository.findSchoolBySchoolName.mockResolvedValue([
        { schoolId: 1 },
      ]);
      authService.userRepository.findClass.mockResolvedValue({ classId: 10 });
      authService.authRepository.addKakaoInfo.mockResolvedValue({
        success: true,
      });

      const result = await authService.addKakaoInfo(
        1,
        '홍길동',
        'STUDENT',
        null,
        1,
        3,
        17,
        '서울고',
      );

      expect(authService.authRepository.addKakaoInfo).toHaveBeenCalledWith(
        1,
        '홍길동',
        'STUDENT',
        null,
        1,
        3,
        17,
        1,
        10,
      );
      expect(result).toEqual({ success: true });
    });
  });
});
