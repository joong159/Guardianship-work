import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
// TODO: 작성하신 analyzeExperience 함수의 실제 경로에 맞게 임포트 경로를 수정해 주세요.
import { analyzeExperience } from './ai-utils'; 

const prisma = new PrismaClient();

// GET /api/experiences?userId=1
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId 파라미터가 필요합니다.' }, { status: 400 });
  }

  try {
    // Prisma를 사용하여 사용자의 경험 이력과 연관된 역량 점수를 함께 조회합니다.
    const experiences = await prisma.experienceHistory.findMany({
      where: {
        userId: parseInt(userId, 10),
      },
      include: {
        scores: true, // 1:N 관계로 설정된 CompetencyScore 데이터를 포함해서 가져옵니다.
      },
      orderBy: {
        createdAt: 'desc', // 생성일순으로 정렬
      },
    });

    // 사용자의 배지 데이터도 Task(과제) 정보와 함께 조회합니다.
    const badges = await prisma.badge.findMany({
      where: { userId: parseInt(userId, 10) },
      include: { task: true },
      orderBy: { createdAt: 'desc' },
    });

    const RATE_LIMIT_PER_DAY = 3;
    
    // UTC 기준으로 현재 날짜의 자정 시간 계산
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // 사용자의 일일 사용량 기록 조회
    const dailyUsage = await prisma.dailyUsage.findUnique({
      where: { userId: parseInt(userId, 10) },
    });

    // 기록이 오늘 날짜인 경우에만 사용 횟수를 가져오고, 그 외에는 0으로 계산합니다.
    const usedCount = (dailyUsage && dailyUsage.date.toISOString().split('T')[0] === today.toISOString().split('T')[0]) ? dailyUsage.count : 0;
    const remainingLimit = Math.max(0, RATE_LIMIT_PER_DAY - usedCount);

    // 두 데이터를 하나의 객체로 묶어서 반환합니다.
    return NextResponse.json({ experiences, badges, remainingLimit }, { status: 200 });
  } catch (error) {
    console.error('경험 이력 조회 중 오류 발생:', error);
    return NextResponse.json({ error: '데이터를 불러오는 데 실패했습니다.' }, { status: 500 });
  }
}

// POST /api/experiences
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, title, duration, description } = body;

    // 필수 데이터 검증
    if (!userId || !title || !duration || !description) {
      return NextResponse.json({ error: '필수 파라미터가 누락되었습니다.' }, { status: 400 });
    }

    const RATE_LIMIT_PER_DAY = 3; // 하루 최대 AI 분석 횟수

    // 현재 날짜의 시작 시간을 가져옵니다. (UTC 기준)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // 사용자의 일일 사용량 기록을 조회하거나 생성합니다.
    let dailyUsage = await prisma.dailyUsage.findUnique({
      where: { userId: parseInt(userId, 10) },
    });

    if (!dailyUsage) {
      // 기록이 없으면 새로 생성
      dailyUsage = await prisma.dailyUsage.create({
        data: { userId: parseInt(userId, 10), date: today, count: 0 },
      });
    } else if (dailyUsage.date.toISOString().split('T')[0] !== today.toISOString().split('T')[0]) {
      // 기록이 있지만 날짜가 다르면 (새로운 날이 시작됨) 카운트 초기화 및 날짜 업데이트
      dailyUsage = await prisma.dailyUsage.update({
        where: { userId: parseInt(userId, 10) },
        data: { date: today, count: 0 },
      });
    }

    // 횟수 제한 확인
    if (dailyUsage.count >= RATE_LIMIT_PER_DAY) {
      return NextResponse.json({ error: `하루 AI 분석 횟수(${RATE_LIMIT_PER_DAY}회)를 초과했습니다. 내일 다시 시도해주세요.` }, { status: 429 });
    }

    // 1. AI를 사용하여 경험 텍스트 분석
    const aiResult = await analyzeExperience(description);
    const { type, scores } = aiResult;

    // AI 분석 성공 시 사용량 카운트 증가
    await prisma.dailyUsage.update({
      where: { userId: parseInt(userId, 10) },
      data: { count: { increment: 1 } },
    });

    // 2. Prisma를 사용하여 DB에 저장 (관계된 데이터인 scores까지 한 번에 생성)
    const newExperience = await prisma.experienceHistory.create({
      data: {
        userId: parseInt(userId, 10),
        title,
        duration,
        description,
        type: type || '기타', // AI가 분류한 타입 (분석 실패 시 '기타'로 저장됨)
        scores: {
          create: scores.map(scoreItem => ({
            category: scoreItem.category,
            score: scoreItem.score,
            reason: scoreItem.reason, // AI가 분석한 한 줄 이유 저장
          })),
        },
      },
      include: {
        scores: true, // 응답으로 생성된 역량 점수 데이터도 포함하여 반환
      },
    });

    return NextResponse.json(newExperience, { status: 201 });
  } catch (error) {
    console.error('경험 이력 저장 중 오류 발생:', error);
    return NextResponse.json({ error: '데이터를 저장하는 데 실패했습니다.' }, { status: 500 });
  }
}

// PATCH /api/experiences
export async function PATCH(request) {
  try {
    const { id, type } = await request.json();

    if (!id || !type) {
      return NextResponse.json({ error: '수정할 id와 새로운 type이 필요합니다.' }, { status: 400 });
    }

    const updatedExperience = await prisma.experienceHistory.update({
      where: { id: parseInt(id, 10) },
      data: { type },
    });

    return NextResponse.json(updatedExperience, { status: 200 });
  } catch (error) {
    console.error('경험 타입 수정 중 오류 발생:', error);
    return NextResponse.json({ error: '데이터를 수정하는 데 실패했습니다.' }, { status: 500 });
  }
}

// DELETE /api/experiences
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '삭제할 id가 필요합니다.' }, { status: 400 });
    }

    // 역량 점수(CompetencyScore)가 ExperienceHistory를 참조하고 있으므로,
    // Prisma 트랜잭션을 사용하여 연관된 점수부터 안전하게 순차적으로 삭제합니다.
    const deleteScores = prisma.competencyScore.deleteMany({
      where: { experienceHistoryId: parseInt(id, 10) },
    });

    const deleteExperience = prisma.experienceHistory.delete({
      where: { id: parseInt(id, 10) },
    });

    await prisma.$transaction([deleteScores, deleteExperience]);

    return NextResponse.json({ message: '성공적으로 삭제되었습니다.' }, { status: 200 });
  } catch (error) {
    console.error('경험 이력 삭제 중 오류 발생:', error);
    return NextResponse.json({ error: '데이터를 삭제하는 데 실패했습니다.' }, { status: 500 });
  }
}