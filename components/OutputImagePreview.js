import Image from 'next/image';
import { useState } from 'react';

export default function OutputImagePreview({ src, alt = "Output Image" }) {
  // Early return if src is not a valid string URL
  if (!src || typeof src !== 'string' || src.trim() === '') {
    return null;
  }
  
  const [aspectRatio, setAspectRatio] = useState(1);

  const handleImageLoad = (e) => {
    if (e.target) {
      const { naturalWidth, naturalHeight } = e.target;
      setAspectRatio(naturalHeight / naturalWidth);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'output-image.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const containerHeight = Math.min(704, 704 * aspectRatio);

  return (
    <div className="max-w-[704px] mx-auto">
      <div 
        className="relative w-full bg-gray-800 rounded-lg overflow-hidden"
        style={{ height: `${containerHeight}px` }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 704px"
          priority
          unoptimized
          onLoadingComplete={handleImageLoad}
        />
        <button
          onClick={handleDownload}
          className="absolute top-2 right-2 p-2 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
          title="Download Image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}