'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const docId = params.id as string;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-blue-600 mb-6 hover:underline font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          새로운 문서 스캔하기
        </button>
        
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
          <FileText className="w-12 h-12 mx-auto text-blue-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">분석 결과</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">문서 ID: <span className="font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded">{docId}</span></p>
          <p className="text-gray-600 dark:text-gray-300">결과 화면이 곧 추가될 예정입니다.</p>
        </div>
      </div>
    </main>
  );
}