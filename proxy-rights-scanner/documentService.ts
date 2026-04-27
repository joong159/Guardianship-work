import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, storage } from './firebase';

/**
 * 문서를 업로드하고, AI로 분석한 뒤, 결과를 Firestore에 저장하는 종합 함수
 * @param file 사용자가 업로드한 이미지 파일
 * @param userId 사용자 ID (로그인 구현 전이라면 임시 ID 사용)
 */
export async function processDocument(file: File, userId: string = 'anonymous_user') {
  try {
    // 1. Firebase Storage에 이미지 업로드 (유저별 폴더로 관리)
    // 파일명 중복을 막기 위해 현재 시간(timestamp)을 파일명 앞에 붙입니다.
    const uniqueFileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `users/${userId}/documents/${uniqueFileName}`);
    
    // 업로드 수행 및 다운로드 URL 가져오기
    const uploadResult = await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(uploadResult.ref);

    // 2. Next.js API 라우트를 통해 Gemini AI 분석 요청
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('AI 분석 요청에 실패했습니다.');
    }

    const { data: analysisResult } = await response.json();

    // 3. 분석 결과와 이미지 URL을 Firestore에 저장 (유저별 컬렉션으로 관리)
    // 경로: users/{userId}/scanned_documents/{documentId}
    const docRef = await addDoc(collection(db, 'users', userId, 'scanned_documents'), {
      fileName: file.name,
      imageUrl: imageUrl, // Storage에서 얻은 이미지 URL
      analysis: analysisResult, // Gemini가 반환한 JSON 대리권 데이터
      createdAt: serverTimestamp(), // 서버 기준 업로드 시간
    });

    // 최종 저장된 데이터의 ID와 정보 반환
    return { id: docRef.id, imageUrl, analysis: analysisResult };
  } catch (error) {
    console.error('문서 처리 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 저장된 문서 분석 결과를 ID로 불러오는 함수
 * @param docId Firestore 문서 ID
 * @param userId 사용자 ID
 */
export async function getDocumentById(docId: string, userId: string = 'anonymous_user') {
  try {
    const docRef = doc(db, 'users', userId, 'scanned_documents', docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('문서 불러오기 오류:', error);
    throw error;
  }
}