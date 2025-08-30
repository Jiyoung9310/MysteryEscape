
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 text-zinc-400 mb-2">
      <div className="w-4 h-4 border-2 border-t-amber-500 border-r-amber-500 border-b-zinc-600 border-l-zinc-600 rounded-full animate-spin"></div>
      <span>생각 중...</span>
    </div>
  );
};

export default LoadingSpinner;
