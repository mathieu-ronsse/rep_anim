export const getValidImageUrl = (prediction) => {
  if (!prediction) return null;
  
  // For both models, we now receive a consistent format
  // with status and output fields
  if (prediction.status === 'succeeded') {
    // Handle string output directly
    console.log("imageUtils > getValidImageUrl > status succeeded");
    if (typeof prediction.output === 'string') {
      //console.log("imageUtils > getValidImageUrl > it's a string");
      return prediction.output;
    }
    // Handle array output
    if (Array.isArray(prediction.output)) {
      //console.log("imageUtils > getValidImageUrl > it's an array");
      return prediction.output[0];
    }
    // Handle object output (for backward compatibility)
    if (typeof prediction.output === 'object' && prediction.output !== null) {
      //console.log("imageUtils > getValidImageUrl > it's an object");
      return prediction.output.url || prediction.output[0];
    }
  }
  
  console.log('Unhandled prediction format:', prediction);
  return null;
};