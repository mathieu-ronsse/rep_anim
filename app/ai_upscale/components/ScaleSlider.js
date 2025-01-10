export default function ScaleSlider({ value, onChange }) {
  const percentage = ((value - 2) / 8) * 100;
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        Upscale ratio: {value}x
      </label>
      <div className="relative">
        <div 
          className="absolute h-2 bg-blue-500 rounded-l-lg" 
          style={{ 
            width: `${percentage}%`,
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 0
          }}
        />
        <input
          type="range"
          min="2"
          max="10"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:hover:bg-blue-600 [&::-webkit-slider-thumb]:transition-colors [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:hover:bg-blue-600 [&::-moz-range-thumb]:transition-colors [&::-moz-range-thumb]:border-0"
          style={{ zIndex: 1 }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>2x</span>
        <span>10x</span>
      </div>
    </div>
  );
}