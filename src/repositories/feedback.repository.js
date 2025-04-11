import { prisma } from '../utils/prisma.utils.js';

class FeedbackRepository {
  // 피드백 작성
  async createFeedback(studentId, feedback, schoolYear) {
    const feedbackWithMeta = feedback.map((item) => ({
      ...item,
      studentId,
      schoolYear,
    }));

    const createdFeedback = await prisma.feedback.createMany({
      data: feedbackWithMeta,
    });

    return createdFeedback;
  }
  // 피드백 수정
  async updateFeedback(studentId, feedback, schoolYear) {
    const updatedFeedback = await prisma.feedback.updateMany({
      where: {
        studentId,
        schoolYear,
      },
      data: feedback,
    });
    return updatedFeedback;
  }
  // 피드백 조회
  async getFeedbackByPeriod(schoolYear, studentId) {
    const feedback = await prisma.feedback.findMany({
      where: {
        schoolYear,
        studentId,
      },
    });
    return feedback;
  }
}

export default FeedbackRepository;
