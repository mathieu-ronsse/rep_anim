'use client';

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import ModelSelector from "@/components/ModelSelector";
import PromptInput from "@/components/PromptInput";
import LoadingButton from "@/components/LoadingButton";
import GenerationOutput from "./components/GenerationOutput";
import { useImageGeneration } from "./hooks/useImageGeneration";
import ErrorMessage from '@/components/ErrorMessage';
import { logServiceUsage, updateServiceUsage } from "@/utils/supabase";
import { uploadToStorage } from '@/utils/storageUtils';

const breadcrumbItems = [
  { href: '/', label: 'Home' },
  { icon: '🪄', label: 'Generate' }
];

export default function AIGenerate() {
  
  const [model, setModel] = useState('sdxl');
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceUsageId, setServiceUsageId] = useState(null);
  const { prediction, myError, myIsLoading, status, generate } = useImageGeneration();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true); 
    setError(null);   
    let newServiceUsageId = null;

    try{
      console.log('Starting generate process...');

      // Call generate API
      //console.log('Calling Replicate generation API...');
      const result = await generate(prompt, model);
      console.log('Generation result: ', JSON.stringify(result, null, 2));
      console.log('Generation result.prediction: ', JSON.stringify(result, null, 2));

      // console.log('Logging initial service usage...');
      // const serviceUsage = await logServiceUsage({
      //   serviceName: 'generate',
      //   prompt: prompt.trim(),
      //   replicateID: result?.prediction.id,
      //   //replicateID: result?.replicateID,
      // });
      
      // if (serviceUsage?.[0]?.id) {
      //   newServiceUsageId = serviceUsage[0].id;
      //   setServiceUsageId(serviceUsage[0].id);
      //   console.log('Service usage logged successfully:', newServiceUsageId);
      // } else {
      //   console.error('Failed to get service usage ID');
      // }

      // const finalPrediction = result?.prediction;
      // console.log('Final prediction received:', finalPrediction);

      // // Update service usage with output URL
      // //if (serviceUsageId && result?.output) {
      // if (serviceUsageId && finalPrediction.output) {
        
      //   const outputFilename = `out_generate_${Date.now()}.png`;
      //   console.log('Uploading output image to storage:', outputFilename);
      //   const outputStorageUrl = await uploadToStorage(finalPrediction.output, outputFilename);
      //   console.log('Output image uploaded successfully:', outputStorageUrl);

      //   await updateServiceUsage({
      //     id: serviceUsageId,
      //     outputImageUrl: outputFilename 
      //     //outputImageUrl: result.output
      //   });
      // }
      } catch (err) {
        console.error('Generate error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    
  };

  return (
    <div className="container max-w-2xl mx-auto px-6 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <h2 className="text-xl italic text-gray-400 mt-4 mb-8">
        Create unique images from text descriptions.
      </h2>

      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col space-y-6 w-full">
        <ModelSelector value={model} onChange={setModel} />
        <PromptInput value={prompt} onChange={setPrompt} placeholder="Describe the image you want to generate..." />
        
        <LoadingButton
          onClick={handleGenerate}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          isLoading={isLoading}
        >
          Generate
        </LoadingButton>
      </form>

      <ErrorMessage message={error} />

      {/* {error && (
        <div className="bg-red-500/10 text-red-500 rounded-lg p-4 mt-6">
          {error}
        </div>
      )} */}

      <GenerationOutput 
        prediction={prediction}
        status={status}
      />
    </div>
  );
}