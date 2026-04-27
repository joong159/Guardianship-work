import { GoogleGenerativeAI } from '@google/generative-ai';

// 환경변수에서 API 키를 가져와 Gemini 클라이언트 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeGuardianshipDocument(fileBuffer: Buffer, mimeType: string) {
  try {
    // 멀티모달 처리에 적합하고 빠른 1.5 Flash 모델 선택
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 요청하신 추출 규칙이 반영된 프롬프트 작성
    const prompt = `
    다음은 '후견등기사항증명서' 이미지(또는 PDF)입니다. 
    이 문서를 분석하여 다음 규칙에 따라 정확하게 데이터를 추출하고 오직 JSON 형식으로만 반환해 주세요. 
    마크다운 텍스트(\`\`\`json 등)는 절대 포함하지 마세요.

    [추출 규칙]
    1. subject: 사건본인의 성명과 생년월일
    2. guardians: 특정후견인 리스트 (각 후견인의 성명, 주소)
    3. proxyRights: 대리권 목록과 권한분장 내용 매칭 (어떤 권한을 어떤 후견인이 가지는지 파악하여 매칭, 예: "부동산 처분": "이재철")
    4. courtPermissions: 법원 허가가 필요한 사항 (별도 구분하여 리스트화)

    [출력 JSON 형식 예시]
    {
      "subject": { "name": "홍길동", "birthDate": "1950-01-01" },
      "guardians": [ { "name": "김철수", "address": "서울시 강남구..." } ],
      "proxyRights": [ { "right": "예금계좌의 관리", "assignedTo": "김철수" } ],
      "courtPermissions": [ "본인 소유 부동산의 처분" ]
    }
    `;

    // Gemini API에 전달할 파일 데이터 구조 포맷팅
    const imageParts = [{
      inlineData: {
        data: fileBuffer.toString("base64"),
        mimeType: mimeType, // "image/jpeg", "image/png", "application/pdf" 등
      },
    }];

    // 프롬프트와 이미지를 함께 전송하여 결과 생성 요청
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    // AI가 반환한 텍스트에서 불필요한 마크다운 백틱을 제거하고 JSON으로 파싱
    const cleanedText = text.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("문서 분석 중 오류가 발생했습니다.");
  }
}