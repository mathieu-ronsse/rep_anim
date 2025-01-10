export default function PromptInput({ value, placeholder, onChange }) {
  return (
    <div className="space-y-2">
      <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">
        Prompt
      </label>
      <textarea
        id="prompt"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={256}
        rows={3}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        placeholder={placeholder}
      />
      <div className="text-xs text-gray-400 text-right">
        {value.length}/256 characters
      </div>
    </div>
  );
}