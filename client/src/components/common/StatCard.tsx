import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'primary' | 'warning' | 'danger' | 'success';
  trend?: {
    text: string;
    isPositive?: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  trend,
}) => {
  const iconColors = {
    default: 'text-slate-500 bg-slate-50 border-slate-200',
    primary: 'text-blue-600 bg-blue-50 border-blue-200',
    warning: 'text-amber-600 bg-amber-50 border-amber-200',
    danger: 'text-rose-600 bg-rose-50 border-rose-200',
    success: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  }[variant];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="mt-2 text-2xl font-bold text-navy tracking-tight">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-600">{subtitle}</p>}
          {trend && (
            <p
              className={`mt-2 text-xs font-medium flex items-center gap-1 ${
                trend.isPositive ? 'text-emerald-600' : 'text-slate-500'
              }`}
            >
              {trend.text}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-md border ${iconColors}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};
