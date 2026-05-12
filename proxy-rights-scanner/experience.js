import express from 'express';
// 실제 파일 경로에 맞게 AI 분석 함수를 임포트하세요.
import { analyzePartTimeExperience } from '../utils/ai.js'; 
import prisma from './lib/db.js'; // 분리된 Prisma 인스턴스를 임포트합니다.
import { authenticateToken } from './middleware/auth.js'; // JWT 검증 미들웨어 추가

const router = express.Router();

// POST /api/experience/analyze (JWT 인증 적용)
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    // authenticateToken 미들웨어를 통과하면 안전하게 req.user에서 userId를 꺼내 쓸 수 있습니다.
    const userId = req.user.userId;
    const { title, duration, experienceText } = req.body;

    // 1. 클라이언트가 데이터를 보냈는지 검증
    if (!experienceText || experienceText.trim() === '') {
      return res.status(400).json({ success: false, message: '알바 경험 텍스트를 입력해주세요.' });
    }
    if (!title) {
      return res.status(400).json({ success: false, message: '알바 제목을 함께 보내주세요.' });
    }

    // 2. AI 분석 함수 호출
    const competencyScores = await analyzePartTimeExperience(experienceText);

    // 3. Prisma를 사용하여 DB에 데이터 저장
    // Prisma의 Nested Writes(중첩 쓰기) 기능을 사용하여 이력과 역량 점수를 한 번에 저장합니다.
    const savedData = await prisma.partTimeHistory.create({
      data: {
        userId: userId,
        title: title,
        duration: duration || '기간 미상',
        description: experienceText,
        scores: {
          create: competencyScores, // [{ category: "성실성", score: 95 }, ...] 형태의 배열
        },
      },
      include: {
        scores: true, // 클라이언트에 응답할 때 저장된 scores 데이터도 포함해서 반환
      },
    });

    // 4. 분석 및 저장 완료된 결과 반환
    return res.status(200).json({ success: true, data: savedData });

  } catch (error) {
    console.error('API 라우터 에러:', error);
    return res.status(500).json({ success: false, message: '서버 내부 오류가 발생했습니다.' });
  }
});

export default router;