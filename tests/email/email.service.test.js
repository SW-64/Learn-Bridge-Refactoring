import { describe, it, expect, vi, beforeEach } from 'vitest';
import EmailService from '../../src/services/email.service.js';
import redis from '../../src/utils/redis.util.js';
import { sendEmail } from '../../src/utils/send-email.util.js';

vi.mock('../../src/utils/redis.util.js');
vi.mock('../../src/utils/send-email.util.js', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

describe('EmailService', () => {
  let emailService;

  beforeEach(() => {
    emailService = new EmailService();
    emailService.userRepository = {
      getUserByEmail: vi.fn(),
    };
    emailService.emailRepository = {
      updateMyPassword: vi.fn(),
    };
    vi.clearAllMocks();
  });

  // ✅ 1. findMyPassword()
  describe('findMyPassword()', () => {
    it('should throw error if code expired', async () => {
      redis.get.mockResolvedValue(null);

      await expect(
        emailService.findMyPassword('a@a.com', '123456'),
      ).rejects.toThrow('인증 코드가 만료되었습니다.');
    });

    it('should throw error if code does not match', async () => {
      redis.get.mockResolvedValue('999999');

      await expect(
        emailService.findMyPassword('a@a.com', '123456'),
      ).rejects.toThrow('인증 코드가 일치하지 않습니다.');
    });

    it('should accept code and set reset-ok flag', async () => {
      redis.get.mockResolvedValue('123456');

      await emailService.findMyPassword('a@a.com', '123456');

      expect(redis.del).toHaveBeenCalledWith('email');
      expect(redis.set).toHaveBeenCalledWith(
        'reset-ok:a@a.com',
        'true',
        'EX',
        300,
      );
    });
  });

  // ✅ 2. sendFindMyPasswordCode()
  describe('sendFindMyPasswordCode()', () => {
    it('should generate code, store to redis, and send email', async () => {
      redis.set.mockResolvedValue();
      redis.get.mockResolvedValue('123456');

      await emailService.sendFindMyPasswordCode('a@a.com');

      expect(redis.set).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalledWith(
        'a@a.com',
        '[인증 코드 알림]',
        expect.stringContaining('인증코드 :'),
      );
    });
  });

  // ✅ 3. setNewPassword()
  describe('setNewPassword()', () => {
    it('should throw error if reset-ok not present', async () => {
      redis.get.mockResolvedValue(null);

      await expect(
        emailService.setNewPassword('a@a.com', 'pw1', 'pw1'),
      ).rejects.toThrow('인증되지 않은 사용자입니다.');
    });

    it('should throw error if passwords do not match', async () => {
      redis.get.mockResolvedValue('true');

      await expect(
        emailService.setNewPassword('a@a.com', 'pw1', 'pw2'),
      ).rejects.toThrow('비밀번호가 일치하지 않습니다.');
    });

    it('should throw error if user not found', async () => {
      redis.get.mockResolvedValue('true');
      emailService.userRepository.getUserByEmail.mockResolvedValue(null);

      await expect(
        emailService.setNewPassword('a@a.com', 'pw', 'pw'),
      ).rejects.toThrow('존재하지 않는 이메일입니다.');
    });

    it('should update password and delete reset-ok key', async () => {
      redis.get.mockResolvedValue('true');
      emailService.userRepository.getUserByEmail.mockResolvedValue({ id: 1 });
      emailService.emailRepository.updateMyPassword.mockResolvedValue({});

      await emailService.setNewPassword('a@a.com', 'pw', 'pw');

      expect(
        emailService.emailRepository.updateMyPassword,
      ).toHaveBeenCalledWith(1, 'pw');
      expect(redis.del).toHaveBeenCalledWith('reset-ok:a@a.com');
    });
  });
});
