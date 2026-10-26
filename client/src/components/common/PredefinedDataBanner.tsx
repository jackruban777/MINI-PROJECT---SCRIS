import React, { useState } from 'react';
import { Sparkles, AlertTriangle, ShieldAlert, CheckCircle2, RefreshCw, Layers } from 'lucide-react';
import { api } from '../../lib/api';

interface PredefinedDataBannerProps {
  onRefresh?: () => void;
  currentRiskCategory?: string;
}

export const PredefinedDataBanner: React.FC<PredefinedDataBannerProps> = ({
  onRefresh,
  currentRiskCategory,
}) => {
  const [activeProfile, setActiveProfile] = useState<string>(currentRiskCategory || 'WATCH');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApplyPreset = async (profileType: 'WATCH' | 'CRITICAL' | 'SAFE') => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const res: any = await api.post('/student/populate-sample-data', { profileType });
      setActiveProfile(profileType);
      setSuccessMessage(res.message || `Predefined ${profileType} profile successfully loaded.`);

      if (onRefresh) {
        onRefresh();
      }

      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to populate predefined records.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200 rounded-lg p-4 sm:p-5 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded bg-blue-600 text-white shadow-sm flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-navy">Predefined Academic Data & Risk Scenarios</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                Interactive Presets
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Simulate diverse course completion scenarios with verified continuous assessments, attendance, and prior arrears.
            </p>
          </div>
        </div>

        {/* Quick Profile Selection Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleApplyPreset('WATCH')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold border transition-all ${
              activeProfile === 'WATCH'
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm ring-2 ring-amber-300'
                : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50'
            } disabled:opacity-50`}
            title="1 Pending Arrear, 72% Borderline Attendance in 1 course, Average Internals"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Watch Profile
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleApplyPreset('CRITICAL')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold border transition-all ${
              activeProfile === 'CRITICAL'
                ? 'bg-rose-600 text-white border-rose-700 shadow-sm ring-2 ring-rose-300'
                : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50'
            } disabled:opacity-50`}
            title="2+ Pending Arrears, Sub-70% Attendance, Formal Counselling Active"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Critical Profile
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleApplyPreset('SAFE')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold border transition-all ${
              activeProfile === 'SAFE' || activeProfile === 'SAFE_HIGH'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-300'
                : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
            } disabled:opacity-50`}
            title="0 Arrears, >90% Attendance across all courses, CGPA 9.0+"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            High Achiever
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleApplyPreset(activeProfile as any || 'WATCH')}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors disabled:opacity-50"
            title="Re-populate and recalculate current preset records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Reload</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-md flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
