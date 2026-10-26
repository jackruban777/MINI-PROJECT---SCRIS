import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { LoadingState } from '../../components/common/LoadingState';
import { AlertTriangle, CheckCircle, Clock, Info } from 'lucide-react';

export const StudentArrears: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArrears = async () => {
      try {
        const res = await api.get('/student/arrears');
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load arrear records');
      } finally {
        setLoading(false);
      }
    };
    fetchArrears();
  }, []);

  if (loading) return <LoadingState message="Loading arrear audit ledger..." />;
  if (error || !data) {
    return <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded">{error}</div>;
  }

  const { pending, cleared, totalPending, totalCleared } = data;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Arrears & Supplementary Examination Audit</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official record of pending course backlogs and completed clearance examinations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-slate-500">Active Arrears</p>
            <p className={`text-2xl font-black ${totalPending > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
              {totalPending}
            </p>
          </div>
          <div
            className={`p-3 rounded-lg border ${
              totalPending > 0
                ? 'bg-amber-50 border-amber-200 text-amber-600'
                : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Institutional Guidance Alert */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-semibold text-navy">Supplementary Examination Regulations:</p>
          <p className="mt-0.5">
            Pending arrears must be cleared within configured institutional attempts. Arrears carry a 30% weight
            in the SCRIS Course Completion Risk Index. Register for upcoming supplementary exams during examination fee registration windows.
          </p>
        </div>
      </div>

      {/* Pending Arrears Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            Pending Course Arrears ({totalPending})
          </h3>
          <span className="text-xs font-semibold text-amber-700">Requires Registration</span>
        </div>

        {pending.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center">
            <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
            <p className="font-semibold text-slate-700">No Pending Arrears</p>
            <p className="text-xs text-slate-500 mt-1">You have successfully cleared all courses attempted to date.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-academic">
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Course Title</th>
                  <th>Credits</th>
                  <th>Original Semester</th>
                  <th>Attempts Recorded</th>
                  <th>Clearance Deadline</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((a: any) => (
                  <tr key={a.id}>
                    <td className="font-mono text-xs font-bold text-blue-700">{a.subject.code}</td>
                    <td className="font-semibold text-slate-800">{a.subject.name}</td>
                    <td className="text-slate-600">{a.subject.credits}</td>
                    <td className="text-slate-700">Semester {a.originalSemester}</td>
                    <td className="text-slate-700">{a.attempts} Attempt(s)</td>
                    <td className="text-slate-600 text-xs">
                      {a.deadlineSemester ? `Before Semester ${a.deadlineSemester}` : 'Institutional standard'}
                    </td>
                    <td>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        PENDING
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cleared Arrears History */}
      {cleared.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Previously Cleared Arrears ({totalCleared})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="table-academic">
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Course Title</th>
                  <th>Original Semester</th>
                  <th>Attempts</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {cleared.map((a: any) => (
                  <tr key={a.id}>
                    <td className="font-mono text-xs font-bold text-blue-700">{a.subject.code}</td>
                    <td className="font-semibold text-slate-800">{a.subject.name}</td>
                    <td className="text-slate-700">Semester {a.originalSemester}</td>
                    <td className="text-slate-700">{a.attempts} Attempt(s)</td>
                    <td>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        CLEARED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
