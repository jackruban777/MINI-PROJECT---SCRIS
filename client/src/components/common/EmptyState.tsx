import React from 'react';
import { AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-8 text-center max-w-md mx-auto my-6">
      <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-500 mb-3">
        {icon || <AlertCircle className="w-6 h-6 text-slate-400" />}
      </div>
      <h3 className="text-base font-semibold text-navy">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-blue-600 text-xs font-semibold rounded text-blue-600 bg-white hover:bg-blue-50 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
