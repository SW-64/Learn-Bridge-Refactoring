import { HTTP_STATUS } from '../constants/http-status.constant.js';
import ConsultationService from '../services/consultation.service.js';
import { BadRequestError } from '../errors/http.error.js';

class ConsultationController {
  consultationService = new ConsultationService();

  // 특정 학생 상담 내역 전체 조회
  getAllConsultation = async (req, res, next) => {
    try {
      const { studentId } = req.params;

      const data =
        await this.consultationService.getAllConsultation(+studentId);

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '상담 전체 조회 성공',
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  // 특정 기준 별 상담 내역 조회 (기간, 과목, 제목, 작성자)
  getConsultation = async (req, res, next) => {
    try {
      const { studentId } = req.params;
      // 날짜, 과목, 제목, 작성자 값 받기
      const { date, subject, title, author } = req.query;

      const data = await this.consultationService.getConsultation(
        date,
        subject,
        title,
        author,
        +studentId,
      );

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '상담 조회 완료',
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  //상담 기록 조회
  getConsultationContent = async (req, res, next) => {
    try {
      // Id 가져오기
      const { studentId, consultationId } = req.params;

      const data = await this.consultationService.getConsultationContent(
        +studentId,
        +consultationId,
      );
      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '상담 기록 조회 완료',
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  //상담 기록 입력
  createConsultation = async (req, res, next) => {
    try {
      // Id 가져오기
      const { studentId } = req.params;
      const userId = req.user.id;

      // 제목, 내용, 날짜, 예정일 값 받기 + 동일과목공개여부
      const { title, content, date, nextPlan, isPublicToSubject } = req.body;

      // 잘못된 날짜 형식을 받는다면 에러 반환 (+null도)
      const isValidDate = (value) => {
        const data = new Date(value);
        return !isNaN(data.getTime()); // 잘못된 날짜를 받는다면 NAN이 나옴
      };

      if (!isValidDate(date) || !isValidDate(nextPlan)) {
        throw new BadRequestError('잘못된 날짜 형식입니다.');
      }

      const data = await this.consultationService.createConsultation(
        title,
        content,
        date,
        nextPlan,
        isPublicToSubject,
        +studentId,
        userId,
      );
      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '상담 입력 완료',
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  // // 상담 내용 수정
  // updateConsultation = async (req, res, next) => {
  //   try {
  //     // Id 가져오기
  //     const { studentId, consultationId } = req.params;
  //     const userId = req.user.id;

  //     // 수정된 제목, 내용, 날짜, 예정일 값 받기
  //     const { title, content, date, nextPlan } = req.body;

  //     const data = await this.consultationService.updateConsultation(
  //       title,
  //       content,
  //       date,
  //       nextPlan,
  //       +studentId,
  //       +consultationId,
  //       userId,
  //     );
  //     return res.status(HTTP_STATUS.OK).json({
  //       status: HTTP_STATUS.OK,
  //       message: '상담 수정 완료',
  //       data,
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // };
}

export default ConsultationController;
