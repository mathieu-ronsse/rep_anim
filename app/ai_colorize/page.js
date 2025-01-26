'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from "@/components/Breadcrumb";
import ImageUploader from '@/app/ai_upscale/components/ImageUploader';
import ImagePreviewWithClear from '@/app/ai_upscale/components/ImagePreviewWithClear';
import ColorizedImage from './components/ColorizedImage';
import ColorizeButton from './components/ColorizeButton';
import ErrorMessage from '@/components/ErrorMessage';
import TokenMessage from '@/components/TokenMessage';
import { useTokenCheck } from '@/hooks/useTokenCheck';
import { validateImageFile, readImageFile } from './utils/imageProcessing';
import { waitForPrediction } from './utils/predictionPolling';
import { logServiceUsage, updateServiceUsage } from "@/utils/supabase";
import { uploadToStorage } from '@/utils/storageUtils';

const REQUIRED_TOKENS = 2; // Colorize requires 2 tokens

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
  const { checkTokens, showMessage, message, setShowMessage } = useTokenCheck();
  const router = useRouter();

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
    setShowMessage(false);
  };

  const handleColorize = async () => {
    if (!preview) return;
    
    try {
      // Check tokens first
      const canProceed = await checkTokens(REQUIRED_TOKENS);
      if (!canProceed) {
        return;
      }

      setIsLoading(true);
      setError(null);
      let newServiceUsageId = null;

      const response = await fetch('/api/colorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: preview
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to colorize image');
      }

      let initialPrediction = await response.json();
      setPrediction(initialPrediction);

      const inputFilename = `${initialPrediction.id}_in_${Date.now()}.png`;
      const inputStorageUrl = await uploadToStorage(preview, inputFilename);

      const serviceUsage = await logServiceUsage({
        serviceName: 'colorize',
        inputImageUrl: inputStorageUrl,
        replicateID: initialPrediction.id,
      });

      if (serviceUsage?.[0]?.id) {
        newServiceUsageId = serviceUsage[0].id;
        setServiceUsageId(serviceUsage[0].id);
      }

      const finalPrediction = await waitForPrediction(initialPrediction, setPrediction);
      
      if (finalPrediction.output) {
        const outputFilename = `${finalPrediction.id}_out_${Date.now()}.png`;
        const outputStorageUrl = await uploadToStorage(finalPrediction.output, outputFilename);
        
        if (newServiceUsageId) {
          await updateServiceUsage({
            id: newServiceUsageId,
            outputImageUrl: outputStorageUrl,
          });
        }
      }
    } catch (err) {
      console.error('Colorize error:', err);
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
          <>
            <ColorizeButton
              onClick={handleColorize}
              isLoading={isLoading}
            />
            {showMessage && (
              <div className="mt-4">
                <TokenMessage message={message} />
              </div>
            )}
          </>
        )}

        <ColorizedImage prediction={prediction} />
      </div>
    </div>
  );
}