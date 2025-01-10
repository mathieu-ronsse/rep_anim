export default function LoadingButton({ 
  isLoading, 
  children, 
  className = "", 
  ...props 
}) {
  return (
    <button
      className={`flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
      ) : children}
    </button>
  );
}