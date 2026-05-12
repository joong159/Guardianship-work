import express from 'express';
import cors from 'cors'; // cors 패키지 임포트
import experienceRouter from './routes/experience.js';
import authRouter from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 8080;

// JSON Body 파싱을 위한 필수 미들웨어
app.use(express.json());

// CORS 미들웨어 추가 (모든 출처 허용)
// 실제 서비스에서는 특정 도메인만 허용하도록 설정하는 것이 좋습니다.
app.use(cors());

// 라우터 등록 (기본 경로: /api/experience)
app.use('/api/experience', experienceRouter);
app.use('/api/auth', authRouter); // 인증 라우터 등록

// 기본 헬스체크 라우트
app.get('/', (req, res) => res.send('API Server is running!'));

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
