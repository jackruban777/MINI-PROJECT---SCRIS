import React from 'react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading academic records...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="mt-4 text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
};
