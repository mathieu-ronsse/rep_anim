'use client';

import Image from 'next/image';
import LoadingButton from '@/components/LoadingButton';

export default function ImagePreview({ src, onUpscale, isLoading }) {
  if (!src) return null;

  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-lg overflow-hidden">
        <Image
          src={src}
          alt="Preview"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 768px"
          priority
        />
      </div>
      <LoadingButton
        onClick={onUpscale}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        isLoading={isLoading}
      >
        Upscale
      </LoadingButton>
    </div>
  );
}