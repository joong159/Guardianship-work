import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db.js'; // 분리해둔 전역 Prisma 인스턴스

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// POST /api/auth/register (회원가입)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 1. 이미 존재하는 이메일인지 확인
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: '이미 사용 중인 이메일입니다.' });
    }

    // 2. 비밀번호 암호화 (해싱)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. DB에 유저 저장
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    res.status(201).json({ success: true, message: '회원가입 성공', userId: newUser.id });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// POST /api/auth/login (로그인)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. 유저 찾기
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    // 2. 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    // 3. JWT 발급 (payload에 userId와 email 포함)
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ success: true, message: '로그인 성공', token });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

export default router;