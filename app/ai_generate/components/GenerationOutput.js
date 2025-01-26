import OutputImagePreview from '@/components/OutputImagePreview';
import { getValidImageUrl } from '../utils/imageUtils';

export default function GenerationOutput({ prediction, status }) {
  if (!prediction) return null;

  //console.log('prediction:', prediction);
  //console.log('GenerationOutput: Full prediction object:', JSON.stringify(prediction, null, 2));

  const imageUrl = getValidImageUrl(prediction);
  
  // Only render if we have a valid image URL
  if (!imageUrl) {
    //console.log('No valid image URL found in prediction:', prediction);
    return null;
  }

  return (
    <div className="mt-6">
      <OutputImagePreview
        src={imageUrl}
        alt="Generated image"
      />
      <p className="mt-2 text-sm text-gray-400 text-center">
        status: {status || (Array.isArray(prediction) ? 'succeeded' : prediction.status)}
      </p>
    </div>
  );
}