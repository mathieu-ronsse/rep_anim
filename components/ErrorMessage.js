export default function ErrorMessage({ message }) {
  if (!message) return null;
  
  return (
    <div className="bg-red-500/10 text-red-500 rounded-lg p-4">
      {message}
    </div>
  );
}