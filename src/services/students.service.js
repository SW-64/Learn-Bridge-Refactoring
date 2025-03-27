import StudentsRepository from '../repositories/students.repository.js';

class StudentsService {
  studentsRepository = new StudentsRepository();
}

export default StudentsService;
