import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { LoadingState } from '../../components/common/LoadingState';
import {
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Layers,
  BookOpen,
  Info,
  TrendingUp,
} from 'lucide-react';

export const StudentCompletion: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompletion = async () => {
      try {
        const res = await api.get('/student/course-completion');
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load course completion projection');
      } finally {
        setLoading(false);
      }
    };
    fetchCompletion();
  }, []);

  if (loading) return <LoadingState message="Calculating graduation timeline and credit progression..." />;
  if (error || !data) {
    return <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded">{error}</div>;
  }

  const {
    currentSemester,
    totalProgramSemesters,
    totalDegreeCreditsRequired,
    totalCreditsEarned,
    creditsRemaining,
    completionPercentage,
    pendingArrearsCount,
    pendingArrearsList,
    pace,
    trajectory,
    contributingFactors,
    assumptions,
  } = data;

  const isOnTime = trajectory.status === 'ON_TIME';
  const isAtRisk = trajectory.status === 'AT_RISK_DELAY';
  const isExtended = trajectory.status === 'EXTENDED_TIMELINE';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Projected Course Completion</h1>
          <p className="text-xs text-slate-500 mt-1">
            Explainable graduation timeline based on earned credits, remaining curriculum requirements, and backlog clearance pace
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${
              isOnTime
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : isAtRisk
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {isOnTime && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {isAtRisk && <AlertTriangle className="w-4 h-4 text-amber-600" />}
            {isExtended && <AlertOctagon className="w-4 h-4 text-rose-600" />}
            {isOnTime ? 'On-Time Trajectory' : isAtRisk ? 'Potential 1-Sem Delay' : 'Extended Timeline'}
          </span>
        </div>
      </div>

      {/* Credit Progress & Estimated Graduation Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Progress Bar Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Degree Credits Progress</span>
            <span className="text-xs font-bold text-navy">
              {totalCreditsEarned} / {totalDegreeCreditsRequired} Credits ({completionPercentage}%)
            </span>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all duration-500 ${
                isOnTime ? 'bg-blue-600' : isAtRisk ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, completionPercentage)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block text-[11px]">Completed Semesters</span>
              <span className="font-bold text-navy text-sm">{currentSemester - 1} / {totalProgramSemesters}</span>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block text-[11px]">Credits Cleared</span>
              <span className="font-bold text-emerald-700 text-sm">{totalCreditsEarned} Cr</span>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block text-[11px]">Credits Outstanding</span>
              <span className="font-bold text-blue-700 text-sm">{creditsRemaining} Cr</span>
            </div>
          </div>
        </div>

        {/* Estimated Graduation Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Projected Graduation</span>
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded">
                <GraduationCap className="w-4 h-4" />
              </span>
            </div>
            <p className="text-3xl font-black text-navy mt-3">{trajectory.estimatedGraduationYear}</p>
            <p className="text-xs text-slate-500 mt-1">
              Estimated Semester: <strong>Sem {trajectory.projectedCompletionSemester}</strong>
              {trajectory.potentialDelaySemesters > 0 && ` (+${trajectory.potentialDelaySemesters} Sem delay)`}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 leading-tight">
            {trajectory.explanation}
          </div>
        </div>
      </div>

      {/* Pace Metrics & Contributing Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Pace Comparison */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-navy">Credit Accumulation Pace</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block text-[11px]">Historical Average Pace:</span>
              <span className="font-bold text-navy text-base">{pace.historicalAverageCreditsPerSem}</span> credits/sem
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block text-[11px]">Required Forward Pace:</span>
              <span className="font-bold text-blue-700 text-base">{pace.requiredAverageCreditsPerSem}</span> credits/sem
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Progression clearance rate is currently <strong>{pace.progressionRate}%</strong> of attempted course credits.
            To maintain on-time graduation, ensure active enrollment in at least {pace.requiredAverageCreditsPerSem} credits per remaining semester.
          </p>
        </div>

        {/* Contributing Factors */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-navy">Contributing Timeline Factors</h3>
          </div>

          <ul className="space-y-2 text-xs text-slate-700">
            {contributingFactors.map((factor: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pending Arrears Impact Table */}
      {pendingArrearsCount > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 bg-rose-50/60 border-b border-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold">Unresolved Arrears Impacting Graduation ({pendingArrearsCount})</h3>
            </div>
            <span className="text-xs font-semibold text-rose-700">Clearance Required</span>
          </div>

          <div className="overflow-x-auto">
            <table className="table-academic">
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Course Title</th>
                  <th>Credits</th>
                  <th>Original Semester</th>
                  <th>Attempts Recorded</th>
                  <th>Recommended Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingArrearsList.map((arr: any) => (
                  <tr key={arr.code}>
                    <td className="font-mono font-bold text-rose-700 text-xs">{arr.code}</td>
                    <td className="font-semibold text-slate-800">{arr.name}</td>
                    <td className="text-slate-600">{arr.credits}</td>
                    <td className="text-slate-600">Semester {arr.originalSemester}</td>
                    <td className="text-slate-600">{arr.attempts} attempt(s)</td>
                    <td className="text-xs text-blue-700 font-medium">
                      Register for next supplementary examination window
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assumptions & Limitations Box */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1.5">
        <div className="flex items-center gap-2 font-semibold text-navy">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Model Assumptions & Uncertainty Notes:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-slate-500">
          {assumptions.map((asm: string, idx: number) => (
            <li key={idx}>{asm}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
