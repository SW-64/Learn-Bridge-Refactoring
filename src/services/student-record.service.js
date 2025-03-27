import StudentRecordRepository from '../repositories/student-record.repository.js';

class StudentRecordService {
  studentRecordRepository = new StudentRecordRepository();
}

export default StudentRecordService;
