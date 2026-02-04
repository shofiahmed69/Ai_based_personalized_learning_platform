'use client';

import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';

interface UploadDropzoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  maxSizeBytes: number;
}

export function UploadDropzone({ onFiles, disabled, maxSizeBytes }: UploadDropzoneProps) {
  const [drag, setDrag] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDrag(false);
      if (disabled) return;
      const files = Array.from(e.dataTransfer.files);
      if (files.length) onFiles(files);
    },
    [disabled, onFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length) onFiles(files);
      e.target.value = '';
    },
    [onFiles]
  );

  const maxMb = Math.round(maxSizeBytes / 1024 / 1024);

  return (
    <label
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/50 py-12 px-6 transition ${
        drag && !disabled ? 'border-violet-500 bg-violet-500/10' : ''
      } ${disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-gray-600'}`}
    >
      <input
        type="file"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
        accept=".pdf,.md,.txt,.docx,application/pdf,text/markdown,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />
      <Upload className="mb-3 h-12 w-12 text-gray-500" />
      <p className="text-center text-gray-400">
        Drag a file here or click to choose. Max {maxMb} MB.
      </p>
      <p className="mt-1 text-center text-xs text-gray-500">
        PDF, Markdown, TXT, DOCX
      </p>
    </label>
  );
}
