'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '../ImageUploader';
import { processDocument } from '../documentService';
import { FileUp, Search } from 'lucide-react';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // 문서 분석 후, 결과 확인 페이지로 자동 이동
      const result = await processDocument(file);
      router.push(`/result/${result.id}`);
    } catch (err) {
      console.error(err);
      setError('문서 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="flex justify-end mb-4 max-w-4xl mx-auto">
          <button onClick={() => router.push('/search')} className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-blue-600 border border-blue-200 rounded-lg shadow-sm hover:bg-blue-50 transition">
            <Search className="w-4 h-4 mr-2" />
            기존 데이터 찾기
          </button>
        </div>
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full p-3 mb-4 dark:bg-blue-900/30 dark:text-blue-400">
            <FileUp className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            대리권 스캐너
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
            후견등기사항증명서 사진을 업로드하여 대리권 목록을 데이터화하세요.
          </p>
        </div>

        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-lg min-h-[300px] flex items-center justify-center p-2">
            <div className="w-full p-4 sm:p-6">
              {!isLoading && !error && (
                <ImageUploader onFileUpload={handleFileUpload} isLoading={isLoading} />
              )}

              {isLoading && (
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
                  <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">AI가 문서를 데이터화하고 있습니다.</p>
                  <p className="text-gray-500 dark:text-gray-400">잠시만 기다려주세요...</p>
                </div>
              )}

              {error && !isLoading && (
                <div className="text-center">
                  <p className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
                  >
                    다시 시도
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}