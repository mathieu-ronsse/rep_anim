'use client';

import { useState } from 'react';
import Breadcrumb from "@/components/Breadcrumb";
import ImageUploader from '@/app/ai_upscale/components/ImageUploader';
import ImagePreviewWithClear from '@/app/ai_upscale/components/ImagePreviewWithClear';
import PromptInput from '@/components/PromptInput';
import LoadingButton from '@/components/LoadingButton';
import ErrorMessage from '@/app/ai_upscale/components/ErrorMessage';
import AnimatedVideo from './components/AnimatedVideo';
import { validateImageFile, readImageFile } from '@/app/ai_upscale/utils/imageProcessing';
import { waitForPrediction } from '@/app/ai_upscale/utils/predictionPolling';

const breadcrumbItems = [
  { href: '/', label: 'Home' },
  { icon: '🎬', label: 'Animate' }
];

export default function Animate() {
  const [preview, setPreview] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

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
    setPrompt('');
    setError(null);
    setPrediction(null);
  };

  const handleAnimate = async () => {
    if (!preview || !prompt.trim()) {
      setError('Please provide both an image and a prompt');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/animate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: preview,
          prompt: prompt.trim()
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to start animation');
      }

      setPrediction(data);
      
      if (data.id) {
        await waitForPrediction(data, setPrediction);
      }
    } catch (err) {
      console.error('Animation error:', err);
      setError(err.message || 'An error occurred while animating');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-6 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <h2 className="text-xl italic text-gray-400 mt-4 mb-8">
        Bring your images to life!
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
            <PromptInput 
              value={prompt}
              onChange={setPrompt}
              placeholder="Describe your animation..."
            />
          </>
        )}

        <ErrorMessage message={error} />

        {preview && (
          <>
            <LoadingButton
              onClick={handleAnimate}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              isLoading={isLoading}
            >
              Animate
            </LoadingButton>

            {(isLoading || (prediction && prediction.status === 'starting')) && (
              <p className="text-center text-gray-400">
                Your animation is being generated, this can take 5 minutes time so please wait or come back in a short while...
              </p>
            )}

            <AnimatedVideo prediction={prediction} />
          </>
        )}
      </div>
    </div>
  );
}