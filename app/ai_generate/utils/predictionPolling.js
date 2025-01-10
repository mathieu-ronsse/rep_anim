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