'use client';

import { useState } from 'react';
import Breadcrumb from "@/components/Breadcrumb";
import ImageUploader from '@/app/ai_upscale/components/ImageUploader';
import ImagePreviewWithClear from '@/app/ai_upscale/components/ImagePreviewWithClear';
import ColorizedImage from './components/ColorizedImage';
import ColorizeButton from './components/ColorizeButton';
import ErrorMessage from '@/app/ai_upscale/components/ErrorMessage';
import { validateImageFile, readImageFile } from './utils/imageProcessing';
import { waitForPrediction } from './utils/predictionPolling';
import { logServiceUsage, updateServiceUsage } from "@/utils/supabase";

const breadcrumbItems = [
  { href: '/', label: 'Home' },
  { icon: '🎨', label: 'Colorize' }
];

export default function Colorize() {
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceUsageId, setServiceUsageId] = useState(null);

  const handleImageSelect = async (file) => {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    try {
      const imageData = await readImageFile(file);
      setPreview(imageData);
      setError(null);
      setPrediction(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setPrediction(null);
    setError(null);
  };

  const handleColorize = async () => {
    if (!preview) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Log service usage immediately
      const serviceUsage = await logServiceUsage({
        serviceName: 'colorize',
        inputImageUrl: preview
      });
      
      if (serviceUsage?.[0]?.id) {
        setServiceUsageId(serviceUsage[0].id);
      }

      const response = await fetch('/api/colorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: preview
        }),
      });

      let prediction = await response.json();
      if (!response.ok) {
        throw new Error(prediction.detail);
      }
      
      setPrediction(prediction);

      console.log("setPrediction done, now await :" + JSON.stringify(prediction, null, 2));
      
      await waitForPrediction(prediction, setPrediction);

      console.log("waitForPrediction done :" + JSON.stringify(prediction, null, 2));
      
      // Update service usage with output URL
      if (serviceUsageId && prediction.output) {
        await updateServiceUsage({
          id: serviceUsageId,
          outputImageUrl: prediction.output
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-6 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <h2 className="text-xl italic text-gray-400 mt-4 mb-8">
        Add vibrant colors to black and white images.
      </h2>

      <div className="space-y-6">
        {!preview ? (
          <ImageUploader onImageSelect={handleImageSelect} />
        ) : (
          <ImagePreviewWithClear 
            src={preview}
            onClear={handleClear}
          />
        )}

        <ErrorMessage message={error} />

        {preview && (
          <ColorizeButton
            onClick={handleColorize}
            isLoading={isLoading}
          />
        )}

        <ColorizedImage prediction={prediction} />
      </div>
    </div>
  );
}