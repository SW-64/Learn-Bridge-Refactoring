import { prisma } from '../utils/prisma.utils.js';

class StudentRecordRepository {
  // 특정 학생 해당 학기 출석 조회
  getStudentAttendance = async (studentRecordId) => {
    const studentAttendance = await prisma.attendance.findMany({
      where: {
        studentRecordId,
      },
    });
    return studentAttendance;
  };
  // 특정 학생 해당 학기 출석 작성 / 수정
  createStudentAttendance = async (studentRecordId, attendanceList) => {
    const studentAttendance = await Promise.all(
      attendanceList.map(async (attendance) => {
        const existing = await prisma.attendance.findFirst({
          where: {
            studentRecordId: studentRecordId,
            date: attendance.date,
          },
        });

        if (existing) {
          return prisma.attendance.update({
            where: { attendanceId: existing.attendanceId },
            data: {
              type: attendance.type,
              reason: attendance.reason,
            },
          });
        } else {
          return prisma.attendance.create({
            data: {
              studentRecordId: studentRecordId,
              date: attendance.date,
              type: attendance.type,
              reason: attendance.reason,
            },
          });
        }
      }),
    );
    return studentAttendance;
  };

  // 특정 학생 출결 정보 조회

  // 특기 사항 조회
  getStudentExtraInfo = async (studentId, grade, semester) => {
    const studentExtraInfo = await prisma.studentRecord.findFirst({
      where: {
        studentId,
        grade,
        semester,
      },
      select: {
        grade: true,
        semester: true,
        extraInfo: true,
      },
    });
    return studentExtraInfo;
  };

  // 특기 사항 작성
  updateStudentExtraInfo = async (studentRecordId, extraInfo) => {
    const studentExtraInfo = await prisma.studentRecord.update({
      where: {
        studentRecordId,
      },
      data: {
        extraInfo,
      },
    });
    return studentExtraInfo;
  };

  // 반 학생 출석 조회
  getClassAttendance = async (classId, date) => {
    const classAttendance = await prisma.attendance.findMany({
      where: {
        studentRecord: {
          student: {
            classId,
          },
        },
        date,
      },
      select: {
        date: true,
        type: true,
        reason: true,
        studentRecord: {
          select: {
            studentId: true,
            student: {
              select: {
                classId: true,
                number: true,
              },
            },
          },
        },
      },
    });
    return classAttendance;
  };

  // 반 학생 출석 작성 / 수정
  createClassAttendance = async (
    classId,
    date,
    attendanceList,
    grade,
    semester,
  ) => {
    const classAttendance = await Promise.all(
      attendanceList.map(async (attendance) => {
        const existedStudentRecord = await prisma.studentRecord.findFirst({
          where: {
            studentId: attendance.studentId,
            grade,
            semester,
          },
        });
        const existedAttendance = await prisma.attendance.findFirst({
          where: {
            studentRecordId: existedStudentRecord.studentRecordId,
            date: attendance.date,
          },
        });
        if (existedAttendance) {
          return prisma.attendance.update({
            where: { attendanceId: existedAttendance.attendanceId },
            data: {
              type: attendance.type,
              reason: attendance.reason,
            },
          });
        } else {
          return prisma.attendance.create({
            data: {
              studentRecordId: existedStudentRecord.studentRecordId,
              date,
              type: attendance.type,
              reason: attendance.reason,
            },
          });
        }
      }),
    );
    return classAttendance;
  };

  // 학생부 생성
  createStudentRecord = async (studentId, grade, semester) => {
    const studentRecord = await prisma.studentRecord.create({
      data: {
        studentId,
        grade,
        semester,
      },
    });
    return studentRecord;
  };

  // 학생부 조회
  getStudentRecord = async (grade, semester, studentId) => {
    const studentRecord = await prisma.studentRecord.findFirst({
      where: {
        studentId,
        grade,
        semester,
      },
    });
    return studentRecord;
  };

  // 특정 학생 출결 정보 조회
  getStudentAttendanceStats = async (studentId) => {
    const studentRecords = await prisma.studentRecord.findMany({
      where: {
        studentId,
      },
      select: {
        grade: true,
        Attendance: {
          select: {
            type: true,
            reason: true,
          },
        },
      },
    });

    const stats = {};

    for (const record of studentRecords) {
      const grade = record.grade;
      if (!stats[grade]) {
        stats[grade] = {
          ABSENCE: { 무단: 0, 질병: 0, 기타: 0 },
          LATE: { 무단: 0, 질병: 0, 기타: 0 },
          EARLY: { 무단: 0, 질병: 0, 기타: 0 },
          PARTIAL_ATTENDANCE: { 무단: 0, 질병: 0, 기타: 0 },
        };
      }
      console.log(record.Attendance);
      for (const att of record.Attendance) {
        const reason =
          att.reason == 1 ? '무단' : att.reason == 2 ? '질병' : '기타';
        const type = att.type;

        if (['무단', '질병', '기타'].includes(reason)) {
          stats[grade][type][reason] += 1;
        } else {
          stats[grade][type]['기타'] += 1;
        }
      }
    }
    return stats;
  };
}

export default StudentRecordRepository;
