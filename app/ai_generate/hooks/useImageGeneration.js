import { useState } from 'react';
import { handleFluxModel, handleSdxlModel } from '../utils/modelUtils';
import { logServiceUsage, updateServiceUsage } from "@/utils/supabase";

export function useImageGeneration() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [serviceUsageId, setServiceUsageId] = useState(null);

  const generate = async (prompt, modelVersion) => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setPrediction(null);
    setStatus('starting');
    let newServiceUsageId = null;

    try {
      console.log(`Starting generation with model: ${modelVersion}`);
      
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          modelVersion
        }),
      });
      
      let initialPrediction = await response.json();
      
      if (!response.ok) {
        throw new Error(initialPrediction.detail || 'Failed to generate image');
      }
      //console.log('useImageGeneration > generate > initialPrediction: ', JSON.stringify(initialPrediction, null, 2));

      setPrediction(initialPrediction);

      const handlers = {
        setStatus,
        setPrediction,
        setError
      };

      //console.log('Logging initial service usage with replicateID:', initialPrediction.id);
      const serviceUsage = await logServiceUsage({
        serviceName: 'generate',
        prompt: prompt.trim(),
        replicateID: initialPrediction.id,
      });

      if (serviceUsage?.[0]?.id) {
        newServiceUsageId = serviceUsage[0].id;
        setServiceUsageId(serviceUsage[0].id);
      } else {
        console.error('Failed to get service usage ID');
      }

      if (modelVersion === 'flux') {
        await handleFluxModel(initialPrediction, handlers,newServiceUsageId);
      } else {
        await handleSdxlModel(initialPrediction, handlers,newServiceUsageId);
      }

    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message);
      setPrediction(null);
      setStatus('failed');
    } finally {
      setIsLoading(false);
    }

  };

  return {
    prediction,
    error,
    isLoading,
    status,
    generate
  };
}