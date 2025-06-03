import { ConflictError } from '../errors/http.error.js';
import EmailRepository from '../repositories/email.repository.js';
import UserRepository from '../repositories/user.repository.js';
import { getRandomCode } from '../utils/random-code.util.js';
import redis from '../utils/redis.util.js';
import { sendEmail } from '../utils/send-email.util.js';

class EmailService {
  emailRepository = new EmailRepository();
  userRepository = new UserRepository();
  // 인증 코드 확인
  findMyPassword = async (email, code) => {
    const redisCode = await redis.get(email);
    if (!redisCode) {
      throw new ConflictError('인증 코드가 만료되었습니다.');
    }
    if (code !== redisCode) {
      throw new ConflictError('인증 코드가 일치하지 않습니다.');
    }
    await redis.del(`email`);
    await redis.set(`reset-ok:${email}`, 'true', 'EX', 300);
    return;
  };
  // 인증 코드 발송
  sendFindMyPasswordCode = async (email) => {
    const code = getRandomCode();
    await redis.set(email, code, 'EX', 300); // 5분 유효기간

    sendEmail(
      email,
      '[인증 코드 알림]',
      `인증코드 : ${code} 입니다. 5분 안에 입력해주세요.`,
    ).catch((err) => {
      console.error('이메일 전송 실패:', err);
    });

    return;
  };

  // 새 비밀번호 설정
  setNewPassword = async (email, newPassword, newPasswordVerified) => {
    const verified = await redis.get(`reset-ok:${email}`);
    if (verified !== 'true') throw new Error('인증되지 않은 사용자입니다.');
    if (newPassword !== newPasswordVerified) {
      throw new ConflictError('비밀번호가 일치하지 않습니다.');
    }
    const user = await this.userRepository.getUserByEmail(email);

    if (!user) throw new ConflictError('존재하지 않는 이메일입니다.');
    const updatedUser = await this.emailRepository.updateMyPassword(
      user.id,
      newPassword,
    );
    await redis.del(`reset-ok:${email}`);
    return;
  };
}

export default EmailService;
