import ImagePreview from './ImagePreview';

export default function ResponsiveImagePreview({ src, alt }) {
  if (!src) return null;

  return (
    <div className="max-w-[500px] mx-auto">
      <div className="aspect-square relative w-full">
        <ImagePreview
          src={src}
          alt={alt}
        />
      </div>
    </div>
  );
}