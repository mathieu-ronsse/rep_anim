export default function AnimatedVideo({ prediction }) {
  if (!prediction?.output) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm opacity-50">status: {prediction.status}</p>
      <video 
        controls 
        loop 
        className="w-full rounded-lg"
        autoPlay
      >
        <source src={prediction.output} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}