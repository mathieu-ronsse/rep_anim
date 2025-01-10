import { useState, useEffect } from 'react';
import ImagePreview from '@/components/ImagePreview';

export default function ImagePreviewWithClear({ src, onClear }) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (src) {
      const img = new Image();
      img.onload = () => {
        setDimensions({
          width: img.width,
          height: img.height
        });
      };
      img.src = src;
    }
  }, [src]);

  const maxWidth = 500;
  const aspectRatio = dimensions.width / dimensions.height;
  const containerStyle = aspectRatio > 1
    ? { width: `${maxWidth}px`, height: `${maxWidth / aspectRatio}px` }
    : { width: `${maxWidth * aspectRatio}px`, height: `${maxWidth}px` };

  return (
    <div className="relative mx-auto" style={containerStyle}>
      <ImagePreview 
        src={src}
        alt="Input Image"
        onDownload={false}
      />
      <button
        onClick={onClear}
        className="absolute top-2 right-2 p-2 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
        title="Clear Image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}