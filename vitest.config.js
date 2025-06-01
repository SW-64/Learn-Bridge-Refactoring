// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // 백엔드 환경
    include: ['tests/**/*.test.js'], // 테스트 파일 경로 지정
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'html'], // text는 터미널, html은 브라우저 확인용
      exclude: ['tests', '**/*.test.js'],
      include: ['src/services/**/*.js'],
    },
  },
});
