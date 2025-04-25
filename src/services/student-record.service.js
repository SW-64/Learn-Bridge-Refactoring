import { ATTENDANCE_TYPE } from '../constants/enum.constant.js';
import StudentRecordRepository from '../repositories/student-record.repository.js';
import StudentsRepository from '../repositories/students.repository.js';
import ClassRepository from './../repositories/class.repository.js';

class StudentRecordService {
  studentRecordRepository = new StudentRecordRepository();
  studentsRepository = new StudentsRepository();
  classRepository = new ClassRepository();
  // 특정 학생 해당 학기 출석 조회
  getStudentAttendance = async (studentId, grade, semester) => {
    const hasRequiredData = studentId && grade && semester;
    if (!hasRequiredData) throw new NotFoundError('값을 불러오지 못했습니다.');

    const existedStudent =
      await this.studentsRepository.getOneStudent(studentId);
    if (!existedStudent)
      throw new NotFoundError('해당 학생이 존재하지 않습니다.');
    const existedStudentRecord =
      await this.studentRecordRepository.getStudentRecord(
        grade,
        semester,
        studentId,
      );
    if (!existedStudentRecord)
      throw new NotFoundError('해당 학기 학생부가 존재하지 않습니다.');
    const studentAttendance =
      await this.studentRecordRepository.getStudentAttendance(
        existedStudentRecord.studentRecordId,
      );
    return studentAttendance;
  };
  // 특정 학생 해당 학기 출석 작성 / 수정
  createStudentAttendance = async (studentId, grade, semester, attendance) => {
    const validAttendanceType = Object.values(ATTENDANCE_TYPE);
    for (const attendance of validAttendanceType) {
      if (
        !attendance.date ||
        !attendance.reason ||
        !attendance.type ||
        !validAttendanceType.includes(attendance.type)
      ) {
        throw new BadRequestError(
          `출결 타입이 없거나 유효하지 않은 출결입니다: ${attendance.type}`,
        );
      }
    }

    const hasRequiredData = studentId && grade && semester;
    if (!hasRequiredData) throw new NotFoundError('값을 불러오지 못했습니다.');
    const existedStudent =
      await this.studentsRepository.getOneStudent(studentId);
    if (!existedStudent)
      throw new NotFoundError('해당 학생이 존재하지 않습니다.');
    const existedStudentRecord =
      await this.studentRecordRepository.getStudentRecord(
        grade,
        semester,
        studentId,
      );
    if (!existedStudentRecord)
      throw new NotFoundError('해당 학기 학생부가 존재하지 않습니다.');
    const studentAttendance =
      await this.studentRecordRepository.createStudentAttendance(
        existedStudentRecord.studentRecordId,
        attendance,
      );
    return studentAttendance;
  };
  // 특정 학생 출결 정보 조회
  getStudentAttendanceStats = async (studentId) => {
    // const studentAttendanceStats =
    //   await this.studentRecordRepository.getStudentAttendanceStats(studentId);
    // return studentAttendanceStats;
  };
  // 특기 사항 조회
  getStudentExtraInfo = async (studentId, semester) => {
    const existedStudent =
      await this.studentsRepository.getOneStudent(studentId);
    if (!existedStudent)
      throw new NotFoundError('해당 학생이 존재하지 않습니다.');

    const studentExtraInfo =
      await this.studentRecordRepository.getStudentExtraInfo(
        studentId,
        existedStudent.grade,
        semester,
      );
    return studentExtraInfo;
  };
  // 특기 사항 작성 / 수정
  createStudentExtraInfo = async (studentId, extraInfo, semester) => {
    const hasRequiredData = studentId && extraInfo && semester;
    if (!hasRequiredData) throw new NotFoundError('값을 불러오지 못했습니다.');
    const existedStudent =
      await this.studentsRepository.getOneStudent(studentId);
    if (!existedStudent)
      throw new NotFoundError('해당 학생이 존재하지 않습니다.');
    const studentExtraInfo =
      await this.studentRecordRepository.createStudentExtraInfo(
        studentId,
        extraInfo,
        semester,
        existedStudent.grade,
      );
    return studentExtraInfo;
  };
  // 반 학생 출석 조회
  getClassAttendance = async (classId, date) => {
    const hasRequiredData = classId && date;
    if (!hasRequiredData) throw new NotFoundError('값을 불러오지 못했습니다.');

    const classAttendance =
      await this.studentRecordRepository.getClassAttendance(classId, date);
    return classAttendance;
  };
  // 반 학생 출석 작성 / 수정
  createClassAttendance = async (classId, grade, date, attendance) => {
    const validAttendanceType = Object.values(ATTENDANCE_TYPE);
    for (const attendance of validAttendanceType) {
      if (
        !attendance.studentId ||
        !attendance.reason ||
        !attendance.type ||
        !validAttendanceType.includes(attendance.type)
      ) {
        throw new BadRequestError(
          `출결 타입이 없거나 유효하지 않은 출결입니다: ${attendance.type}`,
        );
      }
    }
    const hasRequiredData = classId && grade && date;
    if (!hasRequiredData) throw new NotFoundError('값을 불러오지 못했습니다.');
    const classAttendance =
      await this.studentRecordRepository.createClassAttendance(
        classId,
        grade,
        date,
        attendance,
      );
    return classAttendance;
  };
}

export default StudentRecordService;
