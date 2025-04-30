import { ConflictError, NotFoundError } from '../errors/http.error.js';
import GradesRepository from '../repositories/grades.repository.js';
import StudentsRepository from '../repositories/students.repository.js';
import { decrypt, encrypt } from '../utils/crypto.util.js';
class GradesService {
  gradeRepository = new GradesRepository();
  studentRepository = new StudentsRepository();
  // 성적 입력
  createGrades = async (gradesWithStudentId) => {
    // 유효성 검사
    for (const item of gradesWithStudentId) {
      const { schoolYear, semester, subject, score, studentId } = item;
      if (!schoolYear || !semester || !subject || !score || !studentId) {
        throw new NotFoundError('값을 불러오지 못했습니다.');
      }
      const encryptedGrades = encrypt(score);
      // 초기화 벡터
      const scoreIv = encryptedGrades.iv;
      // 암호화된 성적
      const scoreContent = encryptedGrades.content;

      const existedGrades =
        await this.gradeRepository.getGradesByPeriodAndSubject(
          subject,
          studentId,
          schoolYear,
          semester,
        );
      if (existedGrades) {
        throw new ConflictError(
          `이미 존재하는 성적입니다: ${subject}, ${schoolYear}, ${semester}`,
        );
      }
      item.scoreIv = scoreIv;
      item.scoreContent = scoreContent;
      delete item.score;
    }
    const studentId = gradesWithStudentId[0].studentId;
    const student = await this.studentRepository.getOneStudent(studentId);
    const grades = await this.gradeRepository.createGrades(gradesWithStudentId, student.user.id);
    return grades;
  };
  // 성적 조회
  getGrades = async (schoolYear, semester, subject, studentId) => {
    // 과목 or ( 학년, 학기 ) 중 어느 한쪽도 받지 못했다면 에러 반환
    const hasValidQuery = (schoolYear && semester) || subject;
    if (!hasValidQuery)
      throw new NotFoundError(
        '과목 or ( 학년, 학기 ) 중 하나의 값을 입력해주세요',
      );

    // studentId에 맞는 학생이 없을 시, 에러 반환
    const existedStudent =
      await this.studentRepository.getOneStudent(studentId);
    if (!existedStudent)
      throw new NotFoundError('해당 학생이 존재하지 않습니다.');

    // 특정 과목에 대한 성적 조회일 시
    if (subject) {
      const grades = await this.gradeRepository.getGradesBySubject(
        subject,
        studentId,
      );
      for (const grade of grades) {
        // 성적 복호화
        const decryptedGrades = decrypt(grade.scoreIv, grade.scoreContent);
        grade.score = Number(decryptedGrades);
        delete grade.scoreIv;
        delete grade.scoreContent;
      }
      return grades;
    }

    // 특정 기간에 대한 성적 조회일 시
    else if (schoolYear && semester) {
      const grades = await this.gradeRepository.getGradesByPeriod(
        schoolYear,
        semester,
        studentId,
      );
      for (const grade of grades) {
        // 성적 복호화
        const decryptedGrades = decrypt(grade.scoreIv, grade.scoreContent);
        grade.score = Number(decryptedGrades);
        delete grade.scoreIv;
        delete grade.scoreContent;
      }
      return grades;
    }
  };

  // 성적 수정
  updateGrades = async (gradesWithStudentId) => {
    // 유효성 검사
    for (const item of gradesWithStudentId) {
      const { schoolYear, semester, subject, score, studentId } = item;
      if (!schoolYear || !semester || !subject || !score || !studentId) {
        throw new NotFoundError('값을 불러오지 못했습니다.');
      }
      const encryptedGrades = encrypt(score);
      // 초기화 벡터
      const scoreIv = encryptedGrades.iv;
      // 암호화된 성적
      const scoreContent = encryptedGrades.content;

      const existedGrades =
        await this.gradeRepository.getGradesByPeriodAndSubject(
          subject,
          studentId,
          schoolYear,
          semester,
        );

      if (!existedGrades) {
        throw new NotFoundError(
          `입력되지 않은 성적입니다.: ${subject}, ${schoolYear}, ${semester}`,
        );
      }
      item.scoreIv = scoreIv;
      item.scoreContent = scoreContent;
      delete item.score;
    }
    const studentId = gradesWithStudentId[0].studentId;
    const student = await this.studentRepository.getOneStudent(studentId);
    const grades = await this.gradeRepository.updateGrades(gradesWithStudentId, student.user.id);
    return grades;
  };

  // 반 학생의 전체 성적 조회
  getClassGrades = async (classId, semester) => {
    if (!classId || !semester) {
      throw new NotFoundError('반 ID와 학기를 입력해주세요.');
    }
    const grades = await this.gradeRepository.getClassGrades(classId, semester);
    for (const grade of grades) {
      // 성적 복호화
      const decryptedGrades = decrypt(grade.scoreIv, grade.scoreContent);
      grade.score = Number(decryptedGrades);
      delete grade.scoreIv;
      delete grade.scoreContent;
    }
    return grades;
  };
}

export default GradesService;
