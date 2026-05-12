import React, { useState } from 'react';

export interface Skill {
  text: string;
  reason?: string | null;
}

export interface TimelineItem {
  id: string | number;
  dbId?: number;
  type: string;
  experienceType?: string;
  title: string;
  date: string;
  description?: string;
  skills?: Skill[];
  icon: string;
  highlight: boolean;
  imageUrl?: string;
}

interface TimelineListProps {
  items: TimelineItem[];
  onUpdateType: (item: TimelineItem, newType: string) => void;
  onDelete: (item: TimelineItem) => void;
  onItemClick: (item: TimelineItem) => void;
}

export default function TimelineList({ items, onUpdateType, onDelete, onItemClick }: TimelineListProps) {
  const [editingType, setEditingType] = useState(null);
  const [editTypeValue, setEditTypeValue] = useState('');
  const [hoveredTooltip, setHoveredTooltip] = useState(null);

  const startEditingType = (item: TimelineItem) => {
    setEditingType(item.id);
    setEditTypeValue(item.experienceType);
  };

  const handleSaveType = (item: TimelineItem) => {
    onUpdateType(item, editTypeValue);
    setEditingType(null);
  };

  return (
    <div className="relative border-l-2 border-slate-200 ml-4 space-y-8">
      {items.length > 0 ? items.map((item) => (
        <div key={item.id} className="relative pl-6">
          <span className={`absolute -left-[21px] flex h-10 w-10 items-center justify-center rounded-full border-4 border-slate-50 bg-white shadow-sm ${item.type === 'badge' ? 'text-blue-500' : 'text-slate-600'}`}>
            <span className="text-lg">{item.icon}</span>
          </span>

          <div onClick={() => onItemClick(item)} className={`p-5 rounded-2xl shadow-sm border cursor-pointer hover:shadow-md transition-all ${item.highlight ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-slate-800 text-base leading-snug flex items-center gap-2">
                {editingType === item.id ? (
                  <div className="flex items-center gap-1 z-10 relative" onClick={(e) => e.stopPropagation()}>
                    <select value={editTypeValue} onChange={(e) => setEditTypeValue(e.target.value)} className="text-[11px] border border-slate-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option value="알바">알바</option>
                      <option value="인턴">인턴</option>
                      <option value="동아리">동아리</option>
                      <option value="프로젝트">프로젝트</option>
                      <option value="기타">기타</option>
                    </select>
                    <button onClick={() => handleSaveType(item)} className="text-[10px] bg-slate-800 text-white px-2 py-1 rounded">저장</button>
                    <button onClick={() => setEditingType(null)} className="text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded">취소</button>
                  </div>
                ) : (
                  item.experienceType && (
                    <span onClick={(e) => { e.stopPropagation(); startEditingType(item); }} title="경험 타입 수정하기" className="cursor-pointer hover:bg-slate-200 transition-colors text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1 relative z-10">
                      {item.experienceType} ✏️
                    </span>
                  )
                )}
                {item.title}
              </h3>
              
              <div className="flex items-center gap-2 shrink-0 ml-2 z-10 relative">
                <span className="text-[11px] font-medium text-slate-400">{item.date}</span>
                {item.type === 'experience' && (
                  <button onClick={(e) => { e.stopPropagation(); onDelete(item); }} className="text-slate-300 hover:text-red-500 transition-colors p-1" title="삭제하기">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  </button>
                )}
              </div>
            </div>
            
            {item.type === 'badge' && item.imageUrl && (
              <img src={item.imageUrl} alt={item.title} className="w-16 h-16 mt-2 rounded-full border border-slate-200 shadow-sm object-cover" />
            )}

            {item.skills && (
              <div className="flex flex-wrap gap-2 mt-3">
                {item.skills.map((skill, index) => (
                  <div key={index} className="relative inline-block">
                    <span onMouseEnter={() => setHoveredTooltip(`${item.id}-${index}`)} onMouseLeave={() => setHoveredTooltip(null)} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md cursor-help inline-block">
                      {skill.text}
                    </span>
                    {hoveredTooltip === `${item.id}-${index}` && (
                      <div className="absolute z-50 w-48 p-2 text-[11px] font-normal text-white bg-slate-800 rounded-lg shadow-lg left-1/2 -translate-x-1/2 bottom-full mb-2 text-center pointer-events-none leading-relaxed">
                        {skill.reason || '평가 이유가 제공되지 않았습니다.'}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div> 
      )) : (
        <p className="text-slate-500 text-center mt-10">아직 등록된 경험이 없습니다.</p>
      )}
    </div>
  );
}