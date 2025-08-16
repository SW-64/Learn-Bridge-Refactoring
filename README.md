<img width="557" height="557" alt="Image" src="https://github.com/user-attachments/assets/680fea3a-2874-4cdf-98da-ec877484c367" />

#  Learn-Bridge



## 목차 
- 프로젝트 소개 
- 팀원 구성
- 개발 기간
- 개발 환경
- 협업 개발 툴
- 프로젝트 아키텍쳐
- 나의 역할
- 주요 기능 및 설명
- 트러블 슈팅



---
## 프로젝트 소개
- 프로젝트 이름 : Learn Bridge
- 내용 : 담임 교사들이 학생 정보를 효과적으로 관리할 수 있도록 출결·성적·상담 내역을 통합 관리하는 웹 서비스를 개발
- 구분 : 팀 프로젝트
- GitHub : https://github.com/2025SWDesign/Backend
- Figma : https://www.figma.com/design/bKK3PrGzbgFVvA2uMZfIdQ/SWDesign?node-id=0-1&p=f&t=P16Zch5FRirht9DI-0
--- 
## 팀원 구성

FE Engineer 2명
<br /> BE Engineer 2명

##  개발 기간
### 2025.03.19 ~ 2024.06.04
--- 
##  개발 환경
- 운영체제 : Window/Mac
- BackEnd : Javascript, NodeJs, MySQL(Prisma)
- Tool : Visual Studio Code, Insomnia, DBeaver, Jira
---
## 협업 개발 툴

Jira를 통해 우선순위 작업 목록을 관리하며 팀원들과 협업 개발을 진행

<img width="1692" height="386" alt="Image" src="https://github.com/user-attachments/assets/0e70fa4d-4c52-4831-aeab-9dc754305098" />

<img width="784" height="690" alt="Image" src="https://github.com/user-attachments/assets/f3ba879a-273f-4331-83d7-29f55b1708b6" />

---
## 프로젝트 아키텍쳐
<img width="895" height="552" alt="Image" src="https://github.com/user-attachments/assets/22109ede-f05d-4c5d-98a4-c8d3b14968fd" />

---

##  내 역할
  - 서비스에 필요한 전반적인 API 구현 <br /> 
( 인증, 성적, 피드백, 학생 정보, 학생부 API )
- 이메일 발송 구현
- 동시성 처리
- 에러 로그 모니터링 구현
- CICD 적용
- TEST CODE


## 주요 기능 및 설명

### 1. 이메일 발송 구현
Resend 라이브러리 사용

<img width="1050" height="650" alt="Image" src="https://github.com/user-attachments/assets/45f3fbac-8bb6-4b0b-984d-42edd1a53dc6" />

<img width="852" height="268" alt="Image" src="https://github.com/user-attachments/assets/5f14b075-9eae-462d-afac-4eec8e85b1c1" />



#### 왜 Resend를 사용?

사실 이메일 라이브러리는 꽤 많다. 
<br /> 그 중, SMTP 기반 서비스는 이메일 발송을 위해 ID/비밀번호를 환경변수에 넣어야했다.
<br /> 하지만 팀원 모두 개인정보 넣는것에 대해 꺼려하는 상황이 나올 것 같아
<br /> SMTP가 아닌 다른 방법을 찾아봤다.
<br /> 그렇게 되어 Resend를 찾게 되었고, Resend는 SMTP가 아닌 API Key 기반 방식이라 채택하게 되었다.

#### 코드

초기설정
```
import { Resend } from 'resend';
import { RESEND_API_KEY } from '../constants/env.constant.js';

const resend = new Resend(RESEND_API_KEY);

export const sendEmail = async (to, subject, html) => {
  try {
    const response = await resend.emails.send({
      from: 'hello@peopletophoto.site',
      to,
      subject,
      html,
    });
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};
```

사용 예시 코드
```
sendEmail(
      student.user.email,
      '[성적 알림] 성적 입력이 완료되었습니다.',
      `${student.user.name}님의 ${gradesWithStudentId[0].schoolYear}학년 ${gradesWithStudentId[0].semester}학기 성적 입력이 완료되었습니다.`,
    ).catch((err) => {
      console.error('이메일 전송 실패:', err);
    });
```
### 2. 에러 로그 모니터링 구현

#### 구현 이유 

기존에는 PEM 키 보유자만 서버 로그에 접근할 수 있었고, 다른 팀원들은 해당 관리자로부터 전달받는 방식으로 로그를 확인했다.
그러나 서버 관리자가 부재할 경우, 본 서버에서 발생하는 오류를 즉시 파악하기 어려워 문제 확인에 불필요한 시간이 소요되었다.
이에 따라, 모든 팀원이 즉시 로그를 확인할 수 있는 환경을 구축해야겠다고 판단하였다.


####  코드

초기화
```
Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [Sentry.expressIntegration({ app })],
  tracesSampleRate: 1.0,
});
```
에러가 발생한다면
<br />
최종 에러 미들웨어에서 Sentry 전송
```
app.use(async (err, req, res, next) => {
  Sentry.captureException(err);
  await sendSlackErrorAlert(err, req);
```





## 트러블 슈팅
<img width="1214" height="695" alt="Image" src="https://github.com/user-attachments/assets/e733c29c-d1fa-4586-98a8-263b7c927d7f" />

