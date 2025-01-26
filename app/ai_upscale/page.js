'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from "@/components/Breadcrumb";
import ImageUploader from './components/ImageUploader';
import ImagePreviewWithClear from './components/ImagePreviewWithClear';
import UpscaledImage from './components/UpscaledImage';
import UpscaleButton from './components/UpscaleButton';
import ScaleSlider from './components/ScaleSlider';
import ErrorMessage from '@/components/ErrorMessage';
import TokenMessage from '@/components/TokenMessage';
import { useTokenCheck } from '@/hooks/useTokenCheck';
import { validateImageFile, readImageFile } from './utils/imageProcessing';
import { waitForPrediction } from './utils/predictionPolling';
import { logServiceUsage, updateServiceUsage } from "@/utils/supabase";
import { uploadToStorage } from '@/utils/storageUtils';

const REQUIRED_TOKENS = 10; // Upscale requires 1 token

const breadcrumbItems = [
  { href: '/', label: 'Home' },
  { icon: '🔍', label: 'Upscale' }
];

export default function Upscale() {
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scale, setScale] = useState(4);
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

  const handleUpscale = async () => {
    if (!preview) return;
    
    try {
      // Check tokens first
      const canProceed = await checkTokens(REQUIRED_TOKENS);
      console.log("Start service : canProceed = ", canProceed);
      if (!canProceed) {
        return;
      }

      setIsLoading(true);
      setError(null);
      let newServiceUsageId = null;

      const response = await fetch('/api/upscale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: preview,
          scale
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upscale image');
      }

      let initialPrediction = await response.json();
      setPrediction(initialPrediction);

      const inputFilename = `${initialPrediction.id}_in_${Date.now()}.png`;
      const inputStorageUrl = await uploadToStorage(preview, inputFilename);

      const serviceUsage = await logServiceUsage({
        serviceName: 'upscale',
        inputImageUrl: inputStorageUrl,
        replicateID: initialPrediction.id,
        tokensDeducted: REQUIRED_TOKENS,
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
      console.error('Upscale error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-6 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <h2 className="text-xl italic text-gray-400 mt-4 mb-8">
        Enhance image resolution without quality loss.
      </h2>

      <div className="space-y-6">
        {!preview ? (
          <ImageUploader onImageSelect={handleImageSelect} />
        ) : (
          <>
            <ImagePreviewWithClear 
              src={preview}
              onClear={handleClear}
            />
            <ScaleSlider value={scale} onChange={setScale} />
          </>
        )}

        <ErrorMessage message={error} />

        {preview && (
          <>
            <UpscaleButton
              onClick={handleUpscale}
              isLoading={isLoading}
            />
            {showMessage && (
              <div className="mt-4">
                <TokenMessage message={message} />
              </div>
            )}
          </>
        )}

        <UpscaledImage prediction={prediction} />
      </div>
    </div>
  );
}