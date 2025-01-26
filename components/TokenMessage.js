import Link from 'next/link';

export default function TokenMessage({ message }) {
  if (!message) return null;

  return (
    <div className="text-center p-4 bg-gray-800 rounded-lg">
      <p className="text-gray-300 mb-3">{message.title}</p>
      <Link 
        href={message.action.href}
        className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        {message.action.label}
      </Link>
    </div>
  );
}