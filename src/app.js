import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { globalErrorHandler } from './middlewares/error-handler.middleware.js';
import { apiRouter } from './routers/index.js';

const app = express();
const port = process.env.SERVER_PORT;

// CORS 설정
app.use(
  cors({
    origin: '*', // 원래는 프론트엔드 도메인을 허용해야 하지만, 현재 없으므로 제한 X
    credentials: true, // 쿠키 전송 허용 (필요한 경우)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // 허용할 HTTP 메서드
  }),
);

// 미들웨어
app.use(express.json()); // req.body-> JSON 변환을 위해 사용
app.use(express.urlencoded({ extended: true })); // 클라이언트가 보낸 데이터 -> req.body로 변환
app.use(apiRouter);
app.use(globalErrorHandler); // 미들웨어 중, 에러처리 미들웨어는 가장 마지막에

// Test Routing
app.get('/', (req, res) => {
  return res.json('hello world test 1');
});

app.listen(port, () => {
  console.log(`${port}번 포트에서 서버가 열렸습니다!`);
});
