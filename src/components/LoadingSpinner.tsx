export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-primary-100 opacity-30"></div>
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-primary-200 border-t-transparent animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary-300 animate-pulse"></div>
      </div>
    </div>
  );
}