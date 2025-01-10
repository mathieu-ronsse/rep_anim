export const MODEL_VERSIONS = {
  sdxl: {
    version: '8beff3369e81422112d93b89ca01426147de542cd4684c244b673b105188fe5f',
    getInput: (prompt) => ({ prompt })
  },
  flux: {
    model: 'black-forest-labs/flux-schnell',
    getInput: (prompt) => ({
      prompt,
      refine: "expert_ensemble_refiner",
      apply_watermark: false
    })
  }
};