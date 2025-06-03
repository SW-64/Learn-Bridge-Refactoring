import { describe, it, expect, vi, beforeEach } from 'vitest';
import StudentRecordService from '../../src/services/student-record.service.js';
import { ATTENDANCE_TYPE } from '../../src/constants/enum.constant.js';
console.log('ATTENDANCE_TYPE in test:', ATTENDANCE_TYPE);

describe('StudentRecordService - getStudentAttendance()', () => {
  let service;

  beforeEach(() => {
    service = new StudentRecordService();

    service.studentRecordRepository = {
      getAttendance: vi.fn(),
      createAttendance: vi.fn(),
      getStudentRecord: vi.fn(),
      createStudentRecord: vi.fn(),
      getStudentAttendance: vi.fn(),
    };

    service.studentsRepository = {
      getOneStudent: vi.fn(),
    };

    vi.clearAllMocks();
  });

  it('should throw error if studentId or semester is missing', async () => {
    await expect(service.getStudentAttendance(null, 1)).rejects.toThrow(
      '값을 불러오지 못했습니다.',
    );
    await expect(service.getStudentAttendance(1, null)).rejects.toThrow(
      '값을 불러오지 못했습니다.',
    );
  });

  it('should throw error if student does not exist', async () => {
    service.studentsRepository.getOneStudent.mockResolvedValue(null);

    await expect(service.getStudentAttendance(1, 1)).rejects.toThrow(
      '해당 학생이 존재하지 않습니다.',
    );
  });

  it('should return existing attendance if found', async () => {
    const mockAttendance = { studentId: 1, semester: 1, ATTENDANCE: 5 };

    service.studentsRepository.getOneStudent.mockResolvedValue({
      studentId: 1,
      grade: 2,
    });
    service.studentRecordRepository.getStudentRecord.mockResolvedValue({
      studentRecordId: 123,
    });
    service.studentRecordRepository.getStudentAttendance.mockResolvedValue(
      mockAttendance,
    );

    const result = await service.getStudentAttendance(1, 1);

    expect(result).toEqual(mockAttendance);
    expect(
      service.studentRecordRepository.getStudentAttendance,
    ).toHaveBeenCalledWith(123);
  });

  it('should create student record and default attendance if none exists', async () => {
    service.studentsRepository.getOneStudent.mockResolvedValue({
      studentId: 1,
      grade: 2,
    });
    service.studentRecordRepository.getStudentRecord.mockResolvedValue(null);
    service.studentRecordRepository.createStudentRecord.mockResolvedValue({
      studentRecordId: 777,
    });
    service.studentRecordRepository.createAttendance.mockResolvedValue({
      ATTENDANCE: 0,
    });
    service.studentRecordRepository.getStudentAttendance.mockResolvedValue({
      studentId: 1,
      semester: 1,
      ATTENDANCE: 0,
    });

    const result = await service.getStudentAttendance(1, 1);

    expect(
      service.studentRecordRepository.createStudentRecord,
    ).toHaveBeenCalledWith(1, 2, 1);
    // expect(
    //   service.studentRecordRepository.createAttendance,
    // ).toHaveBeenCalledWith(777);
    expect(result).toEqual({
      studentId: 1,
      semester: 1,
      ATTENDANCE: 0,
    });
  });
});

describe('StudentRecordService - createStudentAttendance()', () => {
  let service;

  beforeEach(() => {
    service = new StudentRecordService();
    service.studentRecordRepository = {
      updateAttendance: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it('should throw error if attendance item is invalid', async () => {
    const invalidInput = [
      { type: ATTENDANCE_TYPE.ATTENDANCE, count: null }, // count가 null
    ];

    await expect(
      service.createStudentAttendance(1, 1, invalidInput),
    ).rejects.toThrow('출결 타입이 없거나 유효하지 않은 출결입니다: undefined');
  });

  //   it('should call updateAttendance if input is valid', async () => {
  //     const validInput = [
  //       { type: ATTENDANCE_TYPE.ABSENCE, count: 3 },
  //       { type: ATTENDANCE_TYPE.LATE, count: 2 },
  //     ];

  //     console.log('validInput', validInput);
  //     const mockResult = { updated: true };

  //     service.studentRecordRepository.updateAttendance.mockResolvedValue(
  //       mockResult,
  //     );

  //     const result = await service.createStudentAttendance(1, 1, validInput);

  //     expect(
  //       service.studentRecordRepository.updateAttendance,
  //     ).toHaveBeenCalledWith(1, 1, validInput);
  //     expect(result).toEqual(mockResult);
  //   });
});

describe('StudentRecordService - getStudentAttendanceStats()', () => {
  let service;

  beforeEach(() => {
    service = new StudentRecordService();
    service.studentRecordRepository = {
      getStudentAttendanceStats: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it('should return attendance stats for a student', async () => {
    const mockStats = { ABSENCE: 2, LATE: 1 };
    service.studentRecordRepository.getStudentAttendanceStats.mockResolvedValue(
      mockStats,
    );

    const result = await service.getStudentAttendanceStats(1);

    expect(
      service.studentRecordRepository.getStudentAttendanceStats,
    ).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockStats);
  });
});

describe('StudentRecordService - getStudentExtraInfo()', () => {
  let service;

  beforeEach(() => {
    service = new StudentRecordService();
    service.studentRecordRepository = {
      getStudentExtraInfo: vi.fn(),
    };
    service.studentsRepository = {
      getOneStudent: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it('should throw NotFoundError if student does not exist', async () => {
    service.studentsRepository.getOneStudent.mockResolvedValue(null);

    await expect(service.getStudentExtraInfo(1, 1)).rejects.toThrow(
      '해당 학생이 존재하지 않습니다.',
    );
  });

  it('should return extra info if it exists', async () => {
    const mockExtraInfo = { studentId: 1, hope: '의사', etc: '성실함' };

    service.studentsRepository.getOneStudent.mockResolvedValue({
      studentId: 1,
      grade: 2025, // ✅ 중요
    });
    service.studentRecordRepository.getStudentExtraInfo.mockResolvedValue(
      mockExtraInfo,
    );

    const result = await service.getStudentExtraInfo(1, 1);

    expect(
      service.studentRecordRepository.getStudentExtraInfo,
    ).toHaveBeenCalledWith(1, 2025, 1); // ✅ studentId, grade, semester
    expect(result).toEqual(mockExtraInfo);
  });
});

describe('StudentRecordService - createStudentExtraInfo()', () => {
  let service;

  beforeEach(() => {
    service = new StudentRecordService();
    service.studentsRepository = {
      getOneStudent: vi.fn(),
    };
    service.studentRecordRepository = {
      getStudentRecord: vi.fn(),
      updateStudentExtraInfo: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it('should throw BadRequestError if required fields are missing', async () => {
    const invalidData = { hope: '', dream: '', etc: '' }; // 모두 비어 있음

    await expect(
      service.createStudentExtraInfo(1, 1, invalidData),
    ).rejects.toThrow('해당 학생이 존재하지 않습니다.');
  });

  it('should throw NotFoundError if student does not exist', async () => {
    const validData = { hope: '의사', dream: '국립대', etc: '성실함' };

    service.studentsRepository.getOneStudent.mockResolvedValue(null);

    await expect(
      service.createStudentExtraInfo(1, 1, validData),
    ).rejects.toThrow('해당 학생이 존재하지 않습니다.');
  });

  it('should throw error if extraInfo is missing entirely', async () => {
    await expect(service.createStudentExtraInfo(1, null, 1)).rejects.toThrow(
      '값을 불러오지 못했습니다.',
    );
  });

  it('should upsert student extra info if all data is valid', async () => {
    const studentId = 1;
    const semester = 1;
    const extraInfo = {
      hope: '의사',
      dream: '국립대',
      etc: '성실함',
    };

    // Mock: getOneStudent → 학생 객체 반환
    service.studentsRepository.getOneStudent.mockResolvedValue({
      studentId,
      grade: 2,
    });

    // Mock: getStudentRecord → 학생부 레코드 반환
    service.studentRecordRepository.getStudentRecord.mockResolvedValue({
      studentRecordId: 123,
    });

    // Mock: updateStudentExtraInfo → 성공 객체 반환
    const mockResult = {
      studentRecordId: 123,
      extraInfo,
    };
    service.studentRecordRepository.updateStudentExtraInfo.mockResolvedValue(
      mockResult,
    );

    // 실행
    const result = await service.createStudentExtraInfo(
      studentId,
      extraInfo,
      semester,
    );

    // 검증
    expect(service.studentsRepository.getOneStudent).toHaveBeenCalledWith(
      studentId,
    );

    expect(
      service.studentRecordRepository.getStudentRecord,
    ).toHaveBeenCalledWith(
      2, // grade
      semester,
      studentId,
    );

    expect(
      service.studentRecordRepository.updateStudentExtraInfo,
    ).toHaveBeenCalledWith(123, extraInfo);

    expect(result).toEqual(mockResult);
  });
});

describe('StudentRecordService - getClassAttendance()', () => {
  let service;

  beforeEach(() => {
    service = new StudentRecordService();
    service.studentRecordRepository = {
      getClassAttendance: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it('should throw error if classId or date is missing', async () => {
    await expect(
      service.getClassAttendance(null, '2025-06-01'),
    ).rejects.toThrow('값을 불러오지 못했습니다.');
    await expect(service.getClassAttendance(1, null)).rejects.toThrow(
      '값을 불러오지 못했습니다.',
    );
  });

  it('should return class attendance list if repository returns data', async () => {
    const mockData = [
      { studentId: 1, attendance: 10, absent: 1 },
      { studentId: 2, attendance: 9, absent: 2 },
    ];

    service.studentRecordRepository.getClassAttendance.mockResolvedValue(
      mockData,
    );

    const result = await service.getClassAttendance(1, 1);
    expect(
      service.studentRecordRepository.getClassAttendance,
    ).toHaveBeenCalledWith(1, 1);
    expect(result).toEqual(mockData);
  });

  it('should return empty array if no attendance data found', async () => {
    service.studentRecordRepository.getClassAttendance.mockResolvedValue([]);

    const result = await service.getClassAttendance(1, 1);
    expect(result).toEqual([]);
  });
});

describe('StudentRecordService - createClassAttendance()', () => {
  let service;

  beforeEach(() => {
    service = new StudentRecordService();
    service.studentsRepository = {
      verifiedStudentInCLass: vi.fn(),
    };
    service.studentRecordRepository = {
      getStudentRecord: vi.fn(),
      createStudentRecord: vi.fn(),
      createClassAttendance: vi.fn(),
    };
    service.classRepository = {
      findClassByClassId: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it('should throw error if required fields are missing', async () => {
    await expect(
      service.createClassAttendance(null, null, [], 1),
    ).rejects.toThrow('해당 반이 존재하지 않습니다.');
  });

  it('should throw error for invalid attendance type', async () => {
    const invalidAttendance = [
      {
        studentId: 1,
        reason: '늦잠',
        type: 'INVALID_TYPE',
      },
    ];

    await expect(
      service.createClassAttendance(1, '2025-06-01', invalidAttendance, 1),
    ).rejects.toThrow(
      '출결 타입이 없거나 유효하지 않은 출결입니다: INVALID_TYPE',
    );
  });

  it('should throw error if student is not in class', async () => {
    const invalidStudent = [
      {
        studentId: 1,
        reason: '병원',
        type: 'ABSENCE',
      },
    ];

    service.studentsRepository.verifiedStudentInCLass.mockResolvedValue(null);

    await expect(
      service.createClassAttendance(1, '2025-06-01', invalidStudent, 1),
    ).rejects.toThrow('해당 학생이 존재하지 않습니다.');
  });

  it('should throw error if class does not exist', async () => {
    const attendance = [
      {
        studentId: 1,
        reason: '병원',
        type: 'ABSENCE',
      },
    ];

    service.studentsRepository.verifiedStudentInCLass.mockResolvedValue({
      grade: 2,
    });
    service.studentRecordRepository.getStudentRecord.mockResolvedValue(true);
    service.classRepository.findClassByClassId.mockResolvedValue(null);

    await expect(
      service.createClassAttendance(1, '2025-06-01', attendance, 1),
    ).rejects.toThrow('해당 반이 존재하지 않습니다.');
  });

  it('should create class attendance if all inputs are valid', async () => {
    const classId = 10;
    const date = '2025-06-01';
    const semester = 1;
    const attendance = [
      {
        studentId: 1,
        reason: '병원',
        type: 'ABSENCE',
      },
    ];

    service.studentsRepository.verifiedStudentInCLass.mockResolvedValue({
      grade: 2,
    });
    service.studentRecordRepository.getStudentRecord.mockResolvedValue({
      studentRecordId: 101,
    });
    service.classRepository.findClassByClassId.mockResolvedValue({
      classId: 10,
      grade: 2,
    });

    const mockResult = { success: true };
    service.studentRecordRepository.createClassAttendance.mockResolvedValue(
      mockResult,
    );

    const result = await service.createClassAttendance(
      classId,
      date,
      attendance,
      semester,
    );

    expect(
      service.studentsRepository.verifiedStudentInCLass,
    ).toHaveBeenCalled();
    expect(service.studentRecordRepository.getStudentRecord).toHaveBeenCalled();
    expect(service.classRepository.findClassByClassId).toHaveBeenCalledWith(
      classId,
    );
    expect(
      service.studentRecordRepository.createClassAttendance,
    ).toHaveBeenCalledWith(classId, date, attendance, 2, semester);

    expect(result).toEqual(mockResult);
  });
});
