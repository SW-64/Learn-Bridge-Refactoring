import ConsultationRepository from '../repositories/consultation.repository.js';
import TeacherRepository from '../repositories/teacher.repository.js';

class ConsultationService {
  consultationRepository = new ConsultationRepository();
  teacherRepository = new TeacherRepository();

  // 특정 학생 상담 내역 전체 조회
  getAllConsultation = async (studentId) => {
    const data =
      await this.consultationRepository.getAllConsultation(studentId);
    return data;
  };

  // 특정 기준 별 상담 내역 조회 (기간, 과목, 제목, 작성자)
  getConsultation = async (date, subject, title, author, studentId) => {
    //특정 기간 별 상담 내역 조회
    if (date) {
      const data = await this.consultationRepository.getConsultationByDate(
        studentId,
        date,
      );
      return data;
    }

    //특정 과목 별 상담 내역 조회
    if (subject) {
      const data = await this.consultationRepository.getConsultationBySubject(
        studentId,
        subject,
      );
      return data;
    }

    //특정 제목 별 상담 내역 조회
    else if (title) {
      const data = await this.consultationRepository.getConsultationByTitle(
        studentId,
        title,
      );
      return data;
    }

    //특정 작성자 별 상담 내역 조회
    else if (author) {
      const data = await this.consultationRepository.getConsultationByAuthor(
        studentId,
        author,
      );
      return data;
    }
  };

  //상담 기록 조회
  getConsultationContent = async (studentId, consultationId) => {
    const data = await this.consultationRepository.getConsultationContent({
      studentId,
      consultationId,
    });
    return data;
  };

  //상담 기록 입력
  createConsultation = async (
    title,
    content,
    date,
    nextPlan,
    isPublicToSubject,
    studentId,
    userId,
  ) => {
    // 유저 ID를 통해 선생님 이름, 과목, id 값을 가져오기
    const teacher = await this.teacherRepository.findTeacherByUserId(userId);
    const subject = teacher.subject;
    const author = teacher.user.name;
    const teacherId = teacher.teacherId;

    const data = await this.consultationRepository.create({
      title,
      content,
      date,
      nextPlan,
      isPublicToSubject,
      studentId,
      subject,
      author,
      teacherId,
    });
    return data;
  };

  // // 상담 내용 수정
  // updateConsultation = async (
  //   title,
  //   content,
  //   date,
  //   nextPlan,
  //   studentId,
  //   consultationId,
  //   userId,
  // ) => {
  //   const teacher = await this.teacherRepository.findTeacherByUserId(userId);
  //   const teacherName = teacher.user.name;
  //   const teacherId = teacher.teacherId;

  //   const data = await this.consultationRepository.update({
  //     title,
  //     content,
  //     date,
  //     nextPlan,
  //     studentId,
  //     consultationId,
  //     teacherId,
  //   });
  //   return {
  //     ...data,
  //     teacherName,
  //   };
  // };
}

export default ConsultationService;
