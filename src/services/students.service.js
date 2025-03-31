import StudentsRepository from '../repositories/students.repository.js';

class StudentsService {
  studentsRepository = new StudentsRepository();

  //전체 학생 목록 조회
  checkStudentList= async(userId) => {
    const data = await this.studentsRepository.findAllStudents(userId);
    return data;
  };

  //특정 학생 상세 조회
  checkStudent = async(studentId) => {
    const data = await this.studentsRepository.findStudent(studentId);
    return data;
  };
  
  //특정 학생 정보 수정
  updateStudent = async(studentId, updateData) => {
    const data = await this.studentsRepository.modifyStudent(studentId, updateData);
    return data;
  };

  //특정 학생 정보 삭제
  deleteStudent = async(studentId) => {
    const data = await this.studentsRepository.eraseStudent(studentId);
    return data;
  }
};
export default StudentsService;
