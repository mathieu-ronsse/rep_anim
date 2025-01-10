const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const pollPrediction = async (predictionId) => {
  if (!predictionId) {
    throw new Error('Prediction ID is required');
  }

  const response = await fetch("/api/predictions/" + predictionId);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch prediction');
  }
  
  return response.json();
};

export const waitForPrediction = async (prediction, onUpdate) => {
  if (!prediction?.id) {
    throw new Error('Invalid prediction object');
  }

  let currentPrediction = prediction;
  
  while (
    currentPrediction.status !== "succeeded" && 
    currentPrediction.status !== "failed"
  ) {
    await sleep(1000);
    currentPrediction = await pollPrediction(currentPrediction.id);
    onUpdate(currentPrediction);
  }

  if (currentPrediction.status === "failed") {
    throw new Error('Prediction failed');
  }
  
  return currentPrediction;
};