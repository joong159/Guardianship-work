'use client';

import React, { useState } from 'react';

export default function ExperienceAnalyzer() {
  // 1. 상태(State) 관리
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [experienceText, setExperienceText] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // 2. 폼 제출 핸들러 (API 호출)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 페이지 새로고침 방지
    
    // 초기화 및 로딩 시작
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Express 서버(8080 포트)로 API 요청
      // ※ 실제 배포 환경이나 프록시 설정에 따라 URL 경로를 알맞게 수정하세요.
      const response = await fetch('http://localhost:8080/api/experience/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1, // 테스트용 하드코딩 유저 ID (실제로는 로그인된 유저 ID 사용)
          title,
          duration,
          experienceText,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || '분석 중 오류가 발생했습니다.');
      }

      // 성공 시 결과 상태 업데이트
      setResult(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      // 성공/실패 여부와 관계없이 로딩 상태 종료
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-4">알바 경험을 역량으로 변환하기</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">알바 제목</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 피자집 서빙 알바"
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">근무 기간</label>
          <input 
            type="text" 
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="예: 6개월"
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">상세 경험</label>
          <textarea 
            value={experienceText}
            onChange={(e) => setExperienceText(e.target.value)}
            placeholder="주 20시간, 결근 없음, 진상 고객 응대 경험 많음 등 자세히 적어주세요."
            className="w-full p-2 border border-slate-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className={`w-full py-3 rounded-lg text-white font-semibold transition-colors ${isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isLoading ? 'AI가 역량을 분석 중입니다...' : '역량 분석하기'}
        </button>
      </form>

      {/* 에러 메시지 표시 */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* 결과 표시 */}
      {result && (
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <h3 className="font-bold text-slate-800 mb-2">분석 완료! 🎉</h3>
          <ul className="space-y-2">
            {result.scores.map((scoreObj: any, idx: number) => (
              <li key={idx} className="flex justify-between items-center text-sm bg-white p-2 border border-slate-100 rounded">
                <span className="text-slate-600">{scoreObj.category}</span>
                <span className="font-semibold text-blue-600">{scoreObj.score}점</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}