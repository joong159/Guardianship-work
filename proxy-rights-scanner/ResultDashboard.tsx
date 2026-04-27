'use client';

import { CheckSquare, User, Home, AlertTriangle, FileText, RotateCcw } from 'lucide-react';

// Gemini API가 분석하고 Firestore에 저장될 데이터 구조 정의
// 이 타입들은 lib/gemini.ts의 프롬프트와 일치해야 합니다.
interface Subject {
  name: string;
  birthDate: string;
}

interface Guardian {
  name: string;
  address: string;
}

interface ProxyRight {
  right: string;
  assignedTo: string;
}

export interface AnalysisResult {
  subject: Subject;
  guardians: Guardian[];
  proxyRights: ProxyRight[];
  courtPermissions: string[];
}

interface ResultDashboardProps {
  analysis: AnalysisResult;
  onReset: () => void;
}

// 대리권을 후견인별로 그룹화하는 헬퍼 함수
const groupRightsByGuardian = (rights: ProxyRight[]): Record<string, string[]> => {
  return rights.reduce((acc, current) => {
    const guardianName = current.assignedTo;
    if (!acc[guardianName]) {
      acc[guardianName] = [];
    }
    acc[guardianName].push(current.right);
    return acc;
  }, {} as Record<string, string[]>);
};


export default function ResultDashboard({ analysis, onReset }: ResultDashboardProps) {
  if (!analysis) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 text-center">
        <p className="text-gray-500">분석 데이터가 없습니다.</p>
      </div>
    );
  }

  const rightsByGuardian = groupRightsByGuardian(analysis.proxyRights);
  const allGuardians = analysis.guardians.map(g => g.name);
  // 대리권이 할당되지 않은 후견인도 표시하기 위해 모든 후견인 목록을 가져옴
  allGuardians.forEach(name => {
    if (!rightsByGuardian[name]) {
      rightsByGuardian[name] = [];
    }
  });


  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">대리권 분석 결과</h1>
        <button
          onClick={onReset}
          className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          새로 분석하기
        </button>
      </div>

      {/* 사건본인 정보 */}
      <section className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner">
        <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center">
          <User className="mr-2 h-5 w-5" />
          사건본인 정보
        </h2>
        <div className="space-y-2 text-gray-700 dark:text-gray-300">
          <p><span className="font-semibold">성명:</span> {analysis.subject.name}</p>
          <p><span className="font-semibold">생년월일:</span> {analysis.subject.birthDate}</p>
        </div>
      </section>

      {/* 후견인 목록 */}
      <section className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner">
        <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center">
          <User className="mr-2 h-5 w-5" />
          특정후견인 목록
        </h2>
        <ul className="space-y-3">
          {analysis.guardians.map((guardian, index) => (
            <li key={index} className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-md">
              <p className="font-bold text-gray-800 dark:text-gray-100">{guardian.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                <Home className="mr-2 h-4 w-4" />
                {guardian.address}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* 후견인별 대리권 목록 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          후견인별 대리권
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(rightsByGuardian).map(([guardianName, rights]) => (
            <div key={guardianName} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-inner">
              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">{guardianName}</h3>
              {rights.length > 0 ? (
                <ul className="space-y-2">
                  {rights.map((right, i) => (
                    <li key={i} className="flex items-start">
                      <CheckSquare className="h-5 w-5 text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{right}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">할당된 대리권이 없습니다.</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 법원 허가 필요 사항 */}
      {analysis.courtPermissions && analysis.courtPermissions.length > 0 && (
        <section className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-300 mb-3 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            법원의 허가가 필요한 사항
          </h2>
          <ul className="space-y-2 list-disc list-inside">
            {analysis.courtPermissions.map((permission, index) => (
              <li key={index} className="text-yellow-900 dark:text-yellow-200">
                {permission}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}