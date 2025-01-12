'use client';

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import ModelSelector from "@/components/ModelSelector";
import PromptInput from "@/components/PromptInput";
import LoadingButton from "@/components/LoadingButton";
import GenerationOutput from "./components/GenerationOutput";
import { useImageGeneration } from "./hooks/useImageGeneration";
import { logServiceUsage, updateServiceUsage } from "@/utils/supabase";

const breadcrumbItems = [
  { href: '/', label: 'Home' },
  { icon: '🪄', label: 'Generate' }
];

export default function Generate() {
  const [model, setModel] = useState('sdxl');
  const [prompt, setPrompt] = useState('');
  const [serviceUsageId, setServiceUsageId] = useState(null);
  const { prediction, error, isLoading, status, generate } = useImageGeneration();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    // Log service usage immediately
    const serviceUsage = await logServiceUsage({
      serviceName: 'generate',
      prompt: prompt.trim()
    });
    
    if (serviceUsage?.[0]?.id) {
      setServiceUsageId(serviceUsage[0].id);
    }
    
    // Then generate the image
    const result = await generate(prompt, model);

    // Update service usage with output URL
    if (serviceUsageId && result?.output) {
      await updateServiceUsage({
        id: serviceUsageId,
        outputImageUrl: result.output
      });
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

      {error && (
        <div className="bg-red-500/10 text-red-500 rounded-lg p-4 mt-6">
          {error}
        </div>
      )}

      <GenerationOutput 
        prediction={prediction}
        status={status}
      />
    </div>
  );
}