import { prisma } from '../utils/prisma.utils.js';

class StudentRecordRepository {
  // 특정 학생 해당 학기 출석 조회
  getStudentAttendance = async (studentRecordId) => {
    const studentAttendance = await this.prisma.attendance.findMany({
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
        extraInfo: true,
      },
    });
    return studentExtraInfo;
  };

  // 특기 사항 작성 / 수정
  createStudentExtraInfo = async (studentId, extraInfo, semester, grade) => {
    const studentExtraInfo = await prisma.studentRecord.upsert({
      where: {
        studentId,
        grade,
        semester,
      },
      update: {
        extraInfo,
      },
      create: {
        studentId,
        extraInfo,
        grade,
        semester,
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
      include: {
        studentRecord: {
          include: {
            student: true,
          },
        },
      },
    });
    return classAttendance;
  };

  // 반 학생 출석 작성 / 수정
  createClassAttendance = async (classId, date, attendanceList) => {
    const classAttendance = await Promise.all(
      attendanceList.map(async (attendance) => {
        const existing = await prisma.attendance.findFirst({
          where: {
            studentRecord: {
              student: {
                classId,
              },
            },
            date,
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
              studentRecordId: attendance.studentRecordId,
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
}

export default StudentRecordRepository;
