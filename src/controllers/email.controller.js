import { HTTP_STATUS } from '../constants/http-status.constant.js';
import EmailService from '../services/email.service.js';

class EmailController {
  emailService = new EmailService();

  // 인증 코드 확인
  findMyPassword = async (req, res, next) => {
    try {
      const { code, email } = req.body;

      const data = await this.emailService.findMyPassword(email, code);

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '인증 코드 확인 성공',
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  // 인증 코드 발송
  sendFindMyPasswordCode = async (req, res, next) => {
    try {
      const { email } = req.body;

      const data = await this.emailService.sendFindMyPasswordCode(email);

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '인증 코드 발송 성공',
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  // 새 비밀번호 설정
  setNewPassword = async (req, res, next) => {
    try {
      const { newPassword, newPasswordVerified, email } = req.body;

      const data = await this.emailService.setNewPassword(
        email,
        newPassword,
        newPasswordVerified,
      );

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '새 비밀번호 설정 성공',
        data,
      });
    } catch (err) {
      next(err);
    }
  };
}

export default EmailController;
