import { NextResponse } from 'next/server';
import { analyzeGuardianshipDocument } from './gemini';

export async function POST(request: Request) {
  try {
    // 1. 프론트엔드에서 전송한 FormData에서 파일 추출
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '파일이 제공되지 않았습니다.' }, { status: 400 });
    }

    // 2. File 객체를 Node.js Buffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Gemini API를 통해 문서 분석 실행
    const parsedData = await analyzeGuardianshipDocument(buffer, file.type);
    return NextResponse.json({ success: true, data: parsedData });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: '문서 분석 중 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}