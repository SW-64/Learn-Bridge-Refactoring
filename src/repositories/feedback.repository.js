import { prisma } from '../utils/prisma.utils.js';

class FeedbackRepository {
  // 피드백 작성
  createFeedback = async (studentId, feedback, schoolYear, studentUserId) => {
    const feedbackWithMeta = feedback.map((item) => ({
      ...item,
      studentId,
      schoolYear,
    }));

    const createdFeedback = await prisma.feedback.createMany({
      data: feedbackWithMeta,
    });
    const notification = await prisma.notification.create({
      data : {
        userId: studentUserId,
        type:"FEEDBACK",
        message: `${schoolYear}학년 생성`
      }
    })
    return createdFeedback;
  };
  // 피드백 수정
  updateFeedback = async (studentId, feedback, schoolYear, studentUserId) => {
    const updates = feedback.map((item) =>
      prisma.feedback.updateMany({
        where: {
          studentId,
          schoolYear,
          category: item.category, // 각 카테고리에 해당하는 항목만 수정
        },
        data: {
          content: item.content,
          // category는 enum 필드이므로 수정 필요 없다면 제외
        },
      }),
    );
    const notification = await prisma.notification.create({
      data : {
        userId: studentUserId,
        type:"FEEDBACK",
        message: `${schoolYear}학년 생성`
      }
    })
    const results = await Promise.all(updates);
    return results;
  };
  // 피드백 조회
  getFeedback = async (schoolYear, studentId) => {
    const feedback = await prisma.feedback.findMany({
      where: {
        schoolYear,
        studentId,
      },
      select: {
        schoolYear: true,
        category: true,
        content: true,
        updatedAt: true,
      },
    });
    return feedback;
  };

  // 피드백 상세 조회
  getFeedbackDetail = async (schoolYear, studentId, category) => {
    const feedback = await prisma.feedback.findFirst({
      where: {
        schoolYear,
        studentId,
        category,
      },
    });
    return feedback;
  };

  // 피드백 조회 ( 학생 / 학부모 )
  getMyFeedback = async (studentId, schoolYear) => {
    const feedback = await prisma.feedback.findMany({
      where: {
        studentId,
        schoolYear,
      },
      select: {
        schoolYear: true,
        category: true,
        content: true,
        updatedAt: true,
      },
    });
    return feedback;
  };
}

export default FeedbackRepository;
