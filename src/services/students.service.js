import StudentsRepository from '../repositories/students.repository.js';

class StudentsService {
  studentsRepository = new StudentsRepository();

  //전체 학생 목록 조회
  checkStudentList= async(userId) => {

    const data = await this.studentsRepository.findAllStudents(userId);
    return data;
  };
  
};
export default StudentsService;
