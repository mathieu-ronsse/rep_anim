'use client';

import Link from 'next/link';

const services = [
  { 
    name: 'Generate',
    path: '/ai_generate',
    icon: '🪄',
    description: 'create unique images from text descriptions',
    available: true
  },
  { 
    name: 'Upscale',
    path: '/ai_upscale',
    icon: '🔍',
    description: 'enhance image resolution without quality loss',
    available: true
  },
  { 
    name: 'Colorize',
    path: '/ai_colorize',
    icon: '🎨',
    description: 'add vibrant colors to black and white images',
    available: true
  },
  { 
    name: 'Extract',
    path: '#',
    icon: '✂️',
    description: 'remove backgrounds and isolate objects',
    available: false
  },
  { 
    name: 'Outpaint',
    path: '#',
    icon: '🖼️',
    description: 'extend images beyond their boundaries',
    available: false
  },
  { 
    name: 'Animate',
    path: '/ai_animate',
    icon: '🎬',
    description: 'bring still images to life with motion',
    available: true
  }
];

export default function Home() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Transform your images with AI
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Link 
            key={service.name} 
            href={service.path}
            prefetch={service.available}
            className={`p-6 rounded-lg shadow-lg bg-gray-800 hover:shadow-xl transition-all duration-300
              flex flex-col items-center text-center space-y-3
              ${service.available 
                ? 'hover:scale-105 transform hover:bg-gray-700' 
                : 'opacity-50 cursor-not-allowed'}`}
            onClick={e => !service.available && e.preventDefault()}
          >
            <span className="text-4xl mb-2">{service.icon}</span>
            <h3 className="text-xl font-semibold text-white">{service.name}</h3>
            <p className="text-sm text-gray-400">{service.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}