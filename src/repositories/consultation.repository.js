import { prisma } from '../utils/prisma.utils.js';

class ConsultationRepository {
  // 특정 학생 상담 내역 전체 조회
  getAllConsultation = async (studentId) => {
    const data = await prisma.consultation.findMany({
      where: {
        studentId,
      },
    });
    return data;
  };

  // 특정 기간 별 상담 내역 조회
  getConsultationByDate = async (studentId, date) => {
    const data = await prisma.consultation.findMany({
      where: {
        studentId,
        date: date,
      },
    });
    return data;
  };

  // 특정 제목 별 상담 내역 조회
  getConsultationByTitle = async (studentId, title) => {
    const data = await prisma.consultation.findMany({
      where: {
        studentId,
        title: {
          contains: title,
        },
      },
    });
    return data;
  };

  // 특정 과목 별 상담 내역 조회
  getConsultationBySubject = async (studentId, subject) => {
    const data = await prisma.consultation.findMany({
      where: {
        studentId,
        subject: subject,
      },
    });
    return data;
  };

  // 특정 작성자 별 상담 내역 조회
  getConsultationByAuthor = async (studentId, author) => {
    const data = await prisma.consultation.findMany({
      where: {
        studentId,
        author: author,
      },
    });
    return data;
  };

  // 상담 기록 조회
  getConsultationContent = async ({ studentId, consultationId }) => {
    const data = await prisma.consultation.findUnique({
      where: {
        studentId,
        consultationId: consultationId,
      },
    });
    return data;
  };

  // 상담 기록 입력
  create = async ({
    title,
    content,
    date,
    nextPlan,
    isPublicToSubject,
    subject,
    author,
    studentId,
    teacherId,
  }) => {
    const data = await prisma.consultation.create({
      data: {
        title,
        content,
        date,
        nextPlan,
        isPublicToSubject,
        subject,
        author,
        // 상담테이블을 학생 테이블과 선생 테이블에 연결 (현재로썬 connect만 동작함)
        student: {
          connect: { studentId },
        },
        teacher: {
          connect: { teacherId },
        },
      },
    });
    return data;
  };

  // // 상담 내용 수정
  // update = async ({
  //   title,
  //   content,
  //   date,
  //   nextPlan,
  //   studentId,
  //   consultationId,
  //   teacherId,
  // }) => {
  //   const data = await prisma.consultation.update({
  //     // 내가 찾는 상담 기록이 맞는지 확인
  //     where: {
  //       studentId: studentId,
  //       consultationId: consultationId,
  //       teacherId: teacherId,
  //     },
  //     // 수정할 데이터
  //     data: {
  //       title: title,
  //       content: content,
  //       date: date,
  //       nextPlan: nextPlan,
  //     },
  //   });
  //   return data;
  // };
}

export default ConsultationRepository;
