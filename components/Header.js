import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm z-50 border-b border-gray-800">
      <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-white hover:text-blue-400 transition-colors">
          RepNext
        </Link>
        <button 
          className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-not-allowed"
          disabled
        >
          Sign In
        </button>
      </div>
    </header>
  );
}