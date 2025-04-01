import { NotFoundError } from '../errors/http.error.js';
import GradesRepository from '../repositories/grades.repository.js';

class GradesService {
  gradeRepository = new GradesRepository();

  // 성적 입력
  createGrades = async (schoolYear, semester, subject, score, studentId) => {
    // 받아온 값 중, 하나라도 없으면 에러 반환
    const getData = schoolYear && semester && subject && score && studentId;
    if (!getData) throw new NotFoundError('값을 불러오지 못했습니다.');

    // studentId에 맞는 학생이 없을 시, 에러 반환
    //const existedStudent =

    const grades = await this.gradeRepository.createGrades(
      schoolYear,
      semester,
      subject,
      score,
      studentId,
    );
    return grades;
  };
  // 성적 조회
  getGrades = async (schoolYear, semester, subject, studentId) => {
    // 과목 or ( 학년, 학기 ) 중 어느 한쪽도 받지 못했다면 에러 반환
    const getData = schoolYear || semester || subject;
    if (!getData)
      throw new NotFoundError(
        '과목 or ( 학년, 학기 ) 중 하나의 값을 입력해주세요',
      );

    // studentId에 맞는 학생이 없을 시, 에러 반환
    //const existedStudent =

    // 특정 과목에 대한 성적 조회일 시
    if (!schoolYear && !semester) {
      const grades = await this.gradeRepository.getGradesBySubject(
        subject,
        studentId,
      );
      return grades;
    }

    // 특정 기간에 대한 성적 조회일 시
    else if (!subject) {
      const grades = await this.gradeRepository.getGradesByPeriod(
        schoolYear,
        semester,
        studentId,
      );
      return grades;
    }
  };

  // 성적 수정
  updateGrades = async (schoolYear, semester, subject, studentId, score) => {
    // 받아온 값 중, 하나라도 없으면 에러 반환
    const getData = schoolYear && semester && subject && score && studentId;
    if (!getData) throw new NotFoundError('값을 불러오지 못했습니다.');

    // studentId에 맞는 학생이 없을 시, 에러 반환
    //const existedStudent =

    const grades = await this.gradeRepository.updateGrades(
      schoolYear,
      semester,
      subject,
      studentId,
      score,
    );
    return grades;
  };
}

export default GradesService;
