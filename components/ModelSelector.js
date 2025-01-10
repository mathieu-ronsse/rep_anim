export default function ModelSelector({ value, onChange }) {
  return (
    <div className="space-y-2">
      <label htmlFor="model" className="block text-sm font-medium text-gray-300">
        AI Model
      </label>
      <select
        id="model"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="sdxl">SDXL</option>
        <option value="flux">Flux Schnell</option>
      </select>
    </div>
  );
}