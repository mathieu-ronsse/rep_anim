'use client';

import { useState, useEffect } from 'react';
import Breadcrumb from "@/components/Breadcrumb";
import ImageUploader from './components/ImageUploader';
import ImagePreviewWithClear from './components/ImagePreviewWithClear';
import UpscaledImage from './components/UpscaledImage';
import UpscaleButton from './components/UpscaleButton';
import ScaleSlider from './components/ScaleSlider';
import ErrorMessage from './components/ErrorMessage';
import { validateImageFile, readImageFile } from './utils/imageProcessing';
import { waitForPrediction } from './utils/predictionPolling';
import { logServiceUsage, updateServiceUsage } from "@/utils/supabase";

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
  var newServiceUsageId = null;

  /*
  useEffect(() => {
    console.log('Updated Service Usage ID:', serviceUsageId);
  }, [serviceUsageId]);
  */

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

  const handleUpscale = async () => {
    if (!preview) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Log service usage immediately
      console.log("Log ServiceUsage: start.");
      
      const serviceUsage = await logServiceUsage({
        serviceName: 'upscale',
        inputImageUrl: preview
      });

      //console.log("Showing serviceUsage: " + JSON.stringify(serviceUsage, null, 2));

      if (serviceUsage?.[0]?.id) {
        newServiceUsageId = serviceUsage[0].id;
        setServiceUsageId(serviceUsage[0].id);
      }

      console.log("Log ServiceUsage: completed, running API.");
      console.log("Replicate API Token used: " + process.env.REPLICATE_API_TOKEN);
      console.log("Replicate API Token used: " + process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN);

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

      let prediction = await response.json();
      if (!response.ok) {
        throw new Error(prediction.detail);
      }

      setPrediction(prediction);
      await waitForPrediction(prediction, setPrediction);
      
      console.log("API completed, update ServiceUsage with ID " + newServiceUsageId);
      // Update service usage with output URL
      if (newServiceUsageId && prediction.output) {
        await updateServiceUsage({
          id: newServiceUsageId,
          outputImageUrl: prediction.output
        });
        console.log("Update ServiceUsage: completed");
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
          <UpscaleButton
            onClick={handleUpscale}
            isLoading={isLoading}
          />
        )}

        <UpscaledImage prediction={prediction} />
      </div>
    </div>
  );
}