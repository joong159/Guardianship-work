import React from 'react';
import { TimelineItem } from './TimelineList';

interface ExperienceModalProps {
  item: TimelineItem | null;
  onClose: () => void;
}

export default function ExperienceModal({ item, onClose }: ExperienceModalProps) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 bg-slate-50 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        <div className="flex items-start gap-4 mb-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-2xl shadow-inner border border-slate-200">
            {item.icon}
          </span>
          <div className="pr-6">
            {item.experienceType && (
              <span className="inline-block text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-1 border border-blue-100">
                {item.experienceType}
              </span>
            )}
            <h3 className="text-xl font-extrabold text-slate-800 leading-tight">{item.title}</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">{item.date}</p>
          </div>
        </div>
        
        {item.description && (
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {item.description}
          </div>
        )}

        {item.skills && item.skills.length > 0 && (
          <div>
            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><span className="text-base">📊</span> AI 역량 분석 결과</h4>
            <div className="space-y-2">
              {item.skills.map((skill, index) => (
                <div key={index} className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
                  <p className="font-bold text-slate-700 text-sm mb-1 text-blue-600">{skill.text}</p>
                  <p className="text-xs text-slate-600 leading-relaxed break-keep">{skill.reason || '상세 이유가 없습니다.'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}