import e from 'express';
import { ATTENDANCE_TYPE } from '../constants/enum.constant.js';
import { BadRequestError, NotFoundError } from '../errors/http.error.js';
import StudentRecordRepository from '../repositories/student-record.repository.js';
import StudentsRepository from '../repositories/students.repository.js';
import ClassRepository from './../repositories/class.repository.js';

class StudentRecordService {
  studentRecordRepository = new StudentRecordRepository();
  studentsRepository = new StudentsRepository();
  classRepository = new ClassRepository();
  // 특정 학생 해당 학기 출석 조회
  getStudentAttendance = async (studentId, semester) => {
    const hasRequiredData = studentId && semester;
    if (!hasRequiredData) throw new NotFoundError('값을 불러오지 못했습니다.');

    const existedStudent =
      await this.studentsRepository.getOneStudent(studentId);
    if (!existedStudent)
      throw new NotFoundError('해당 학생이 존재하지 않습니다.');
    const existedStudentRecord =
      await this.studentRecordRepository.getStudentRecord(
        existedStudent.grade,
        semester,
        studentId,
      );
    if (!existedStudentRecord) {
      const createStudentRecord =
        await this.studentRecordRepository.createStudentRecord(
          studentId,
          existedStudent.grade,
          semester,
        );
      const studentAttendance =
        await this.studentRecordRepository.getStudentAttendance(
          createStudentRecord.studentRecordId,
        );
      return studentAttendance;
    } else {
      const studentAttendance =
        await this.studentRecordRepository.getStudentAttendance(
          existedStudentRecord.studentRecordId,
        );
      return studentAttendance;
    }
  };
  // 특정 학생 해당 학기 출석 작성 / 수정
  createStudentAttendance = async (studentId, semester, attendance) => {
    const validAttendanceType = Object.values(ATTENDANCE_TYPE);
    for (const item of attendance) {
      console.log(item);
      if (
        !item.date ||
        !item.reason ||
        !item.type ||
        !validAttendanceType.includes(item.type)
      ) {
        throw new BadRequestError(
          `출결 타입이 없거나 유효하지 않은 출결입니다: ${attendance.type}`,
        );
      }
    }

    const hasRequiredData = studentId && semester;
    if (!hasRequiredData) throw new NotFoundError('값을 불러오지 못했습니다.');
    const existedStudent =
      await this.studentsRepository.getOneStudent(studentId);
    if (!existedStudent)
      throw new NotFoundError('해당 학생이 존재하지 않습니다.');
    const existedStudentRecord =
      await this.studentRecordRepository.getStudentRecord(
        existedStudent.grade,
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
  // 특기 사항 작성
  createStudentExtraInfo = async (studentId, extraInfo, semester) => {
    const hasRequiredData = studentId && extraInfo && semester;
    if (!hasRequiredData) throw new NotFoundError('값을 불러오지 못했습니다.');
    const existedStudent =
      await this.studentsRepository.getOneStudent(studentId);
    if (!existedStudent)
      throw new NotFoundError('해당 학생이 존재하지 않습니다.');
    const existedStudentRecord =
      await this.studentRecordRepository.getStudentRecord(
        existedStudent.grade,
        semester,
        studentId,
      );
    const studentExtraInfo =
      await this.studentRecordRepository.updateStudentExtraInfo(
        existedStudentRecord.studentRecordId,
        extraInfo,
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
  createClassAttendance = async (classId, date, attendance, semester) => {
    const validAttendanceType = Object.values(ATTENDANCE_TYPE);
    for (const item of attendance) {
      if (
        !item.studentId ||
        !item.reason ||
        !item.type ||
        !validAttendanceType.includes(item.type)
      ) {
        throw new BadRequestError(
          `출결 타입이 없거나 유효하지 않은 출결입니다: ${item.type}`,
        );
      }
      const verifiedStudentInCLass =
        await this.studentsRepository.verifiedStudentInCLass(
          item.studentId,
          classId,
        );
      if (!verifiedStudentInCLass)
        throw new NotFoundError('해당 학생이 존재하지 않습니다.');

      const existedStudentRecord =
        await this.studentRecordRepository.getStudentRecord(
          verifiedStudentInCLass.grade,
          semester,
          item.studentId,
        );
      if (!existedStudentRecord) {
        await this.studentRecordRepository.createStudentRecord(
          item.studentId,
          verifiedStudentInCLass.grade,
          semester,
        );
      }
    }
    const existedClass = await this.classRepository.findClassByClassId(classId);
    if (!existedClass) throw new NotFoundError('해당 반이 존재하지 않습니다.');
    const hasRequiredData = classId && date;
    if (!hasRequiredData) throw new NotFoundError('값을 불러오지 못했습니다.');
    const classAttendance =
      await this.studentRecordRepository.createClassAttendance(
        classId,
        date,
        attendance,
        existedClass.grade,
        semester,
      );
    return classAttendance;
  };
}

export default StudentRecordService;
