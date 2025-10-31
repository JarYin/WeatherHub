export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          {/* Spinner */}
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          
          {/* Pulsing circles */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
            <div className="w-16 h-16 border-4 border-blue-300 rounded-full animate-ping opacity-20"></div>
          </div>
        </div>
        
        <h2 className="mt-6 text-xl font-semibold text-gray-700">Loading...</h2>
        <p className="mt-2 text-sm text-gray-500">Please wait while we fetch your data</p>
      </div>
    </div>
  );
}