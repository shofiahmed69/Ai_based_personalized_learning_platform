export function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-6 w-6 animate-spin rounded-full border-2 border-gray-700 border-t-violet-500 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
