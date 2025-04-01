import { MESSAGES } from '../constants/message.constant.js';
import { NotFoundError } from '../errors/http.error.js';
import StudentsRepository from '../repositories/students.repository.js';

class StudentsService {
  studentsRepository = new StudentsRepository();

  //전체 학생 목록 조회
  getAllStudent= async(userId) => {
    const data = await this.studentsRepository.getAllStudent(userId);
    return data;
  };

  //특정 학생 상세 조회 , 유효성 검사
  getOneStudent = async(studentId) => {
    const student = await this.studentsRepository.getOneStudent(studentId);
    if(!student) {
      throw new NotFoundError(MESSAGES.STUDENT.COMMON.NOT_FOUND)
    }
    return student;
  };
  
  //특정 학생 정보 수정
  updateOneStudent = async(studentId, updateData) => {
    const student = await this.studentsRepository.getOneStudent(studentId); //유효성 검사 추가가
    if(!student) {
      throw new NotFoundError(MESSAGES.STUDENT.COMMON.NOT_FOUND)
    }
    const data = await this.studentsRepository.updateOneStudent(studentId, updateData);
    return data;
  };

  //특정 학생 정보 삭제
  deleteOneStudent = async(studentId) => {
    const student = await this.studentsRepository.getOneStudent(studentId);
    if(!student) {
      throw new NotFoundError(MESSAGES.STUDENT.COMMON.NOT_FOUND)
    }
    const data = await this.studentsRepository.deleteOneStudent(studentId);
    return data;
  }
};
export default StudentsService;
