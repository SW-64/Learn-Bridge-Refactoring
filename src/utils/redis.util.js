import Redis from 'ioredis';

const redis = new Redis({
  host: '127.0.0.1', // 서버 내부에서만 접속
  port: 6379,
});
redis.ping().then(console.log); // "PONG" 출력되면 연결 성공

export default redis;
