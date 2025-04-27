import { HTTP_STATUS } from '../constants/http-status.constant.js';
import FeedbackService from '../services/feedback.service.js';

class FeedbackController {
  feedbackService = new FeedbackService();

  // 피드백 작성
  createFeedback = async (req, res, next) => {
    try {
      const { studentId } = req.params;
      const content = req.body;
      const { schoolYear } = req.query;

      const feedback = await this.feedbackService.createFeedback(
        +studentId,
        content.feedbacks,
        +schoolYear,
      );

      return res.status(HTTP_STATUS.CREATED).json({
        status: HTTP_STATUS.CREATED,
        message: '피드백 작성 완료',
        data: feedback,
      });
    } catch (error) {
      next(error);
    }
  };

  // 피드백 수정
  updateFeedback = async (req, res, next) => {
    try {
      const { studentId } = req.params;
      const content = req.body;
      const { schoolYear } = req.query;

      const feedback = await this.feedbackService.updateFeedback(
        +studentId,
        content.feedbacks,
        +schoolYear,
      );

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '피드백 수정 완료',
        data: feedback,
      });
    } catch (error) {
      next(error);
    }
  };
  // 피드백 조회
  getFeedback = async (req, res, next) => {
    try {
      const { studentId } = req.params;
      const { schoolYear } = req.query;

      const feedback = await this.feedbackService.getFeedback(
        +studentId,
        +schoolYear,
      );

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '피드백 조회 완료',
        data: feedback,
      });
    } catch (error) {
      next(error);
    }
  };

  // 피드백 조회 ( 학생 / 학부모 )
  getMyFeedback = async (req, res, next) => {
    try {
      const { schoolYear } = req.query;
      const userId = req.user.id;
      const feedback = await this.feedbackService.getMyFeedback(
        userId,
        +schoolYear,
      );

      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '내 피드백 조회 완료',
        data: feedback,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default FeedbackController;
