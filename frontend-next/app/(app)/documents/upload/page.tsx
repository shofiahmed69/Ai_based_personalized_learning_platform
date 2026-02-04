'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useUploadDocument } from '@/hooks/useDocuments';
import { UploadDropzone } from '@/components/documents/UploadDropzone';

const MAX_MB = 50;
const MAX_BYTES = MAX_MB * 1024 * 1024;

export default function UploadPage() {
  const router = useRouter();
  const upload = useUploadDocument();
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      const file = files[0];
      if (file.size > MAX_BYTES) {
        toast.error(`File must be under ${MAX_MB} MB`);
        return;
      }
      setUploading(true);
      try {
        const doc = await upload.mutateAsync(file);
        toast.success('Document uploaded — processing…');
        if (doc?.id) router.push(`/documents/${doc.id}`);
        else router.push('/documents');
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [upload, router]
  );

  return (
    <div className="p-6 lg:p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-100">Upload document</h1>
      <UploadDropzone onFiles={handleFiles} disabled={uploading} maxSizeBytes={MAX_BYTES} />
    </div>
  );
}
