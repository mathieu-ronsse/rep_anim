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
import { uploadToStorage } from '@/utils/storageUtils';

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
    let newServiceUsageId = null;

    try {
      console.log('Starting upscale process...');

      // Call Replicate API
      //console.log('Calling Replicate upscale API...');
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

      let initialPrediction = await response.json();
      if (!response.ok) {
        throw new Error(initialPrediction.detail);
      }
      
      //console.log('Initial prediction received:', initialPrediction);
      setPrediction(initialPrediction);

      // Upload input image to Supabase Storage
      const inputFilename = `${initialPrediction.id}_in_${Date.now()}.png`;
      //console.log('Uploading input image to storage:', inputFilename);
      const inputStorageUrl = await uploadToStorage(preview, inputFilename);
      //console.log('Input image uploaded successfully:', storedInputUrl);

      //console.log('Logging initial service usage...');
      const serviceUsage = await logServiceUsage({
        serviceName: 'upscale',
        inputImageUrl: inputStorageUrl,
        replicateID: initialPrediction.id,
      });

      if (serviceUsage?.[0]?.id) {
        newServiceUsageId = serviceUsage[0].id;
        setServiceUsageId(serviceUsage[0].id);
        //console.log('Service usage logged successfully:', newServiceUsageId);
      } else {
        console.error('Failed to get service usage ID');
      }

      // Wait for prediction and get final result
      //console.log('Waiting for prediction completion...');
      const finalPrediction = await waitForPrediction(initialPrediction, setPrediction);
      //console.log('Final prediction received:', finalPrediction);
      
      // Upload output image to Supabase Storage
      if (finalPrediction.output) {
        const outputFilename = `${finalPrediction.id}_out_${Date.now()}.png`;
        //console.log('Uploading output image to storage:', outputFilename);
        const outputStorageUrl = await uploadToStorage(finalPrediction.output, outputFilename);
        //console.log('Output image uploaded successfully:', outputStorageUrl);
        
        // Update Service Usage with the stored output image URL
        if (newServiceUsageId) {
          //console.log('Updating service usage with output URL...');
          await updateServiceUsage({
            id: newServiceUsageId,
            outputImageUrl: outputStorageUrl,
          });
          //console.log('Service usage updated successfully');
        }
      }
    } catch (err) {
      //console.error('Upscale error:', err);
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