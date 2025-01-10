import { pollPrediction } from './predictionPolling';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function handleFluxModel(result, { setStatus, setPrediction, setError }) {
  try {
    //console.log('Processing FLUX result:', result);
    console.log('modelUtils > handleFluxModel > result: ', JSON.stringify(result, null, 2));

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

export async function handleSdxlModel(result, { setStatus, setPrediction, setError }) {
  try {
    setPrediction(result);
    let currentPrediction = result;
    setStatus(currentPrediction.status);

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
  } catch (error) {
    console.error('Error handling SDXL model:', error);
    setError(error.message);
    setStatus('failed');
  }
}