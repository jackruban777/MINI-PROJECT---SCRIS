import React from 'react';

interface RiskBadgeProps {
  category: 'SAFE' | 'WATCH' | 'CRITICAL' | string;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  category,
  score,
  size = 'md',
  showScore = true,
}) => {
  const cat = category.toUpperCase();

  const styles = {
    SAFE: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    WATCH: 'bg-amber-50 text-amber-800 border-amber-200',
    CRITICAL: 'bg-rose-50 text-rose-800 border-rose-200',
  }[cat] || 'bg-slate-50 text-slate-700 border-slate-200';

  const dotColors = {
    SAFE: 'bg-emerald-500',
    WATCH: 'bg-amber-500',
    CRITICAL: 'bg-rose-500',
  }[cat] || 'bg-slate-400';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-medium',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-semibold border ${styles} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors}`} />
      <span>{cat}</span>
      {showScore && score !== undefined && (
        <span className="opacity-75 font-normal">({score}/100)</span>
      )}
    </span>
  );
};
