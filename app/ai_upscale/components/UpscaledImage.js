import OutputImagePreview from '@/components/OutputImagePreview';

export default function UpscaledImage({ prediction }) {
  if (!prediction?.output) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm opacity-50">status: {prediction.status}</p>
      <OutputImagePreview
        src={prediction.output}
        alt="Upscaled"
      />
    </div>
  );
}