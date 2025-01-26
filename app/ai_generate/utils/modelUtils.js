import { pollPrediction } from './predictionPolling';
import { updateServiceUsage } from "@/utils/supabase";
import { uploadToStorage } from '@/utils/storageUtils';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function handleFluxModel(result, { setStatus, setPrediction, setError },newServiceUsageId) {
  try {
    //console.log('Processing FLUX result:', result);
    if (!result?.status || !result?.output) {
      throw new Error('Invalid response from FLUX model');
    }
    
    setStatus(result.status);
    setPrediction(result);
    
  } catch (error) {
    console.error('Error handling FLUX model:', error);
    setError(error.message);
    setStatus('failed');
  }
}

export async function handleSdxlModel(result, { setStatus, setPrediction, setError },newServiceUsageId) {
  try {
    setPrediction(result);
    let currentPrediction = result;
    setStatus(currentPrediction.status);

    //console.log('modelUtils > handleSdxlModel > result: ', JSON.stringify(result, null, 2));
    while (
      currentPrediction.status !== "succeeded" &&
      currentPrediction.status !== "failed"
    ) {
      await sleep(1000);
      currentPrediction = await pollPrediction(currentPrediction.id);
      setPrediction(currentPrediction);
      setStatus(currentPrediction.status);

      if (currentPrediction.status === "failed") {
        throw new Error('Image generation failed');
      }
    }
    //console.log('Final prediction:', currentPrediction);
    const finalPrediction = currentPrediction;
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

  } catch (error) {
    console.error('Error handling SDXL model:', error);
    setError(error.message);
    setStatus('failed');
  }
}