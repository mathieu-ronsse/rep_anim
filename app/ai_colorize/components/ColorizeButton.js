import LoadingButton from '@/components/LoadingButton';

export default function ColorizeButton({ onClick, isLoading }) {
  return (
    <LoadingButton
      onClick={onClick}
      className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      isLoading={isLoading}
    >
      Colorize
    </LoadingButton>
  );
}