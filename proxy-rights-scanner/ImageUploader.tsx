'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

interface ImageUploaderProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

export default function ImageUploader({ onFileUpload, isLoading }: ImageUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'application/pdf': [],
    },
    multiple: false,
    disabled: isLoading,
  });

  return (
    <div
      {...getRootProps()}
      className={`w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors
        ${isDragActive
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'}
        ${isLoading
          ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-700/50'
          : ''}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center">
        <UploadCloud className={`h-12 w-12 mb-4 ${isDragActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">분석할 파일을 드래그 앤 드롭하거나 클릭하세요.</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">(JPG, PNG, PDF 파일 지원)</p>
      </div>
    </div>
  );
}