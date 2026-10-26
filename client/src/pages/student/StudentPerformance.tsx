import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { LoadingState } from '../../components/common/LoadingState';
import { ShieldCheck, BookOpen, Calendar } from 'lucide-react';

export const StudentPerformance: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await api.get('/student/performance');
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load internal assessment performance');
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  if (loading) return <LoadingState message="Loading internal assessment marks..." />;
  if (error || !data) {
    return <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded">{error}</div>;
  }

  const { assessmentsBySubject } = data;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Internal Assessment Performance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Verified records of continuous internal assessments (CAT-1, CAT-2, Assignments)
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          Read-Only Institutional Records
        </div>
      </div>

      {assessmentsBySubject.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-sm text-slate-500">
          No internal assessment records have been published for the current semester.
        </div>
      ) : (
        <div className="space-y-6">
          {assessmentsBySubject.map((group: any) => (
            <div key={group.subject.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {group.subject.code}
                  </span>
                  <h3 className="text-sm font-bold text-navy">{group.subject.name}</h3>
                  <span className="text-xs text-slate-500">({group.subject.credits} Credits)</span>
                </div>
                <div className="text-xs font-medium text-slate-600">
                  Subject Internal Average:{' '}
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      group.averagePercentage < 50
                        ? 'bg-rose-100 text-rose-800'
                        : group.averagePercentage < 65
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {group.averagePercentage}%
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="table-academic">
                  <thead>
                    <tr>
                      <th>Assessment Component</th>
                      <th>Score Obtained</th>
                      <th>Maximum Score</th>
                      <th>Percentage</th>
                      <th>Assessment Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.assessments.map((a: any) => (
                      <tr key={a.id}>
                        <td className="font-semibold text-navy">{a.assessmentType}</td>
                        <td className="font-bold text-slate-800">{a.score}</td>
                        <td className="text-slate-500">{a.maxScore}</td>
                        <td>
                          <span
                            className={`font-semibold ${
                              a.percentage < 50
                                ? 'text-rose-600'
                                : a.percentage < 65
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {a.percentage}%
                          </span>
                        </td>
                        <td className="text-slate-500 text-xs">
                          {new Date(a.assessmentDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              a.percentage >= 50
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {a.percentage >= 50 ? 'SATISFACTORY' : 'SUB-THRESHOLD'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
