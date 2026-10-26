import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { LoadingState } from '../../components/common/LoadingState';
import { Target, CheckCircle2, AlertOctagon, TrendingUp, BookOpen } from 'lucide-react';
import { RiskBadge } from '../../components/common/RiskBadge';

export const StudentSubjectFocus: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjectFocus = async () => {
      try {
        const res = await api.get('/student/subject-focus');
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load subject focus analysis');
      } finally {
        setLoading(false);
      }
    };
    fetchSubjectFocus();
  }, []);

  if (loading) return <LoadingState message="Calculating subject focus priorities..." />;
  if (error || !data) {
    return <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded">{error}</div>;
  }

  const { subjectFocus, recommendations, riskCategory, riskScore } = data;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Priority Course Focus & Action Plan</h1>
          <p className="text-xs text-slate-500 mt-1">
            Data-driven prioritization ranking enrolled courses by risk indicators and academic difficulty
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RiskBadge category={riskCategory} score={riskScore} size="md" />
        </div>
      </div>

      {/* Global Academic Action Recommendations */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Overall Action Guidance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.map((rec: string, i: number) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-md bg-blue-50/60 border border-blue-100 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ranked Subjects List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Ranked Enrolled Courses ({subjectFocus.length})
        </h3>

        {subjectFocus.map((sub: any, idx: number) => (
          <div
            key={sub.subjectId}
            className={`bg-white border rounded-lg p-5 shadow-sm transition-all ${
              sub.riskLevel === 'HIGH'
                ? 'border-rose-200 hover:border-rose-300'
                : sub.riskLevel === 'MEDIUM'
                ? 'border-amber-200 hover:border-amber-300'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                  #{idx + 1}
                </span>
                <span className="font-mono text-xs font-bold text-blue-700">{sub.code}</span>
                <h4 className="text-sm font-bold text-navy">{sub.name}</h4>
                <span className="text-xs text-slate-500">({sub.credits} Credits)</span>
              </div>

              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded border ${
                  sub.riskLevel === 'HIGH'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : sub.riskLevel === 'MEDIUM'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {sub.riskLevel} PRIORITY
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Internal Assessment Avg</p>
                <p className="text-base font-bold text-navy mt-1">
                  {sub.internalAverage !== null ? `${sub.internalAverage}%` : 'Pending'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Class Attendance</p>
                <p className="text-base font-bold text-navy mt-1">
                  {sub.attendancePercentage !== null ? `${sub.attendancePercentage}%` : 'N/A'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Course Standing</p>
                <p className="text-base font-bold text-navy mt-1">
                  {sub.hasArrear ? (
                    <span className="text-rose-600 font-bold">Pending Arrear</span>
                  ) : (
                    <span className="text-emerald-700 font-bold">Current Enrolled</span>
                  )}
                </p>
              </div>
            </div>

            {/* Contributing Risk Factors */}
            {sub.contributingFactors.length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] font-bold text-slate-500 uppercase mb-1">Identified Concerns:</p>
                <div className="flex flex-wrap gap-2">
                  {sub.contributingFactors.map((factor: string, fIdx: number) => (
                    <span key={fIdx} className="text-xs bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded">
                      &bull; {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Target Action */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-navy">Recommended Action: </span>
                <span className="text-slate-700">{sub.recommendedAction}</span>
              </div>
              {sub.targetMetric && (
                <span className="flex-shrink-0 font-bold text-blue-700 bg-white border border-blue-300 px-2.5 py-1 rounded shadow-sm">
                  {sub.targetMetric}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
