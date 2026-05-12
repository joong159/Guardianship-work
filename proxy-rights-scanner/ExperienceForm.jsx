import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

const AI_LOADING_MESSAGES = [
  "AI가 당신의 경험을 꼼꼼히 읽어보는 중... 🧐",
  "숨겨진 직무 역량을 영혼까지 끌어모으는 중... 🚀",
  "HR 전문가 빙의 중... 👔",
  "거의 다 왔어요! 땀 닦는 중... 💦",
  "멋진 역량 칩을 굽고 있습니다... 🍪"
];

interface ExperienceFormProps {
  // any 대신 백엔드 반환 응답에 맞춘 타입을 세부적으로 정의할 수도 있습니다.
  onSuccess: (newItem: any) => void;
  remainingLimit: number;
}

export default function ExperienceForm({ onSuccess, remainingLimit }: ExperienceFormProps) {
  const [formData, setFormData] = useState({ title: '', duration: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState(AI_LOADING_MESSAGES[0]);

  // AI 분석 중 재미있는 로딩 문구 교체 효과
  useEffect(() => {
    let interval;
    if (isSubmitting) {
      let currentIndex = 0;
      setLoadingText(AI_LOADING_MESSAGES[0]);
      interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % AI_LOADING_MESSAGES.length;
        setLoadingText(AI_LOADING_MESSAGES[currentIndex]);
      }, 2000); // 2초마다 문구 변경
    }
    return () => clearInterval(interval);
  }, [isSubmitting]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title || !formData.duration || !formData.description) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const userId = 1; // 예시 하드코딩
      const response = await fetch('/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...formData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // 429 Too Many Requests 에러 처리
        if (response.status === 429) throw new Error(errorData.error);
        throw new Error('데이터 저장에 실패했습니다.');
      }
      
      const newItem = await response.json();
      onSuccess(newItem); // 성공 시 부모 컴포넌트로 새 데이터 전달
      setFormData({ title: '', duration: '', description: '' }); // 폼 초기화
    } catch (e) {
      alert(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative mb-8 p-5 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center transition-all duration-300">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-slate-800 mb-4"></div>
          <p className="text-slate-800 font-bold text-sm animate-pulse text-center px-4">{loadingText}</p>
        </div>
      )}
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="text-lg">✨</span> 새로운 경험 기록하기
      </h3>
      <div className="space-y-3">
        <input name="title" value={formData.title} onChange={handleInputChange} placeholder="경험 제목 (예: 피자집 서빙 알바)" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500" />
        <input name="duration" value={formData.duration} onChange={handleInputChange} placeholder="기간 (예: 6개월)" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500" />
        <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="상세 내용 (예: 주 20시간, 결근 없이 고객 응대 수행)" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm h-24 resize-none focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500" />
        
        <div className="text-right pt-1">
          <span className={`text-[11px] font-semibold mr-1 ${remainingLimit > 0 ? 'text-slate-500' : 'text-red-500'}`}>
            오늘 남은 AI 분석: <span className="font-bold">{remainingLimit}</span>/3회
          </span>
        </div>
        <button type="submit" disabled={isSubmitting || remainingLimit <= 0} className={`w-full text-white font-semibold p-2.5 rounded-lg text-sm transition-colors ${isSubmitting || remainingLimit <= 0 ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700'}`}>
          {isSubmitting ? 'AI 분석 중...' : remainingLimit <= 0 ? '오늘은 더 이상 분석할 수 없어요' : '분석 및 추가하기'}
        </button>
      </div>
    </form>
  );
}