import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { LoadingState } from '../../components/common/LoadingState';
import { CalendarCheck, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';

export const StudentAttendance: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get('/student/attendance');
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load attendance records');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) return <LoadingState message="Loading subject attendance audit records..." />;
  if (error || !data) {
    return <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded">{error}</div>;
  }

  const { records, overallPercentage, threshold, atRiskCount } = data;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Class Attendance Audit</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official attendance tracking for examination hall ticket eligibility (Threshold: {threshold}%)
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-slate-500">Overall Attendance</p>
            <p
              className={`text-2xl font-black ${
                overallPercentage < threshold ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {overallPercentage}%
            </p>
          </div>
          <div
            className={`p-3 rounded-lg border ${
              overallPercentage < threshold
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            }`}
          >
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {atRiskCount > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3 text-xs text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Attendance Alert: Examination Debarment Risk</p>
            <p className="mt-1">
              You have <strong>{atRiskCount} subject(s)</strong> below the mandatory {threshold}% threshold.
              Refer to the remedial targets below to regain exam hall ticket eligibility.
            </p>
          </div>
        </div>
      )}

      {/* Attendance Records Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy">Current Semester Course Attendance</h3>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Read-Only Academic System
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-academic">
            <thead>
              <tr>
                <th>Course</th>
                <th>Attended / Total</th>
                <th>Percentage</th>
                <th>Status</th>
                <th>Attendance Requirement Guidance</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r: any) => (
                <tr key={r.id}>
                  <td>
                    <span className="font-mono text-xs font-bold text-blue-700 mr-2">{r.code}</span>
                    <span className="font-semibold text-slate-800">{r.name}</span>
                  </td>
                  <td className="font-mono text-xs text-slate-700">
                    <strong>{r.attendedClasses}</strong> / {r.totalClasses} classes
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold text-xs ${
                          r.isBelowThreshold ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {r.percentage}%
                      </span>
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 hidden sm:block">
                        <div
                          className={`h-1.5 rounded-full ${
                            r.isBelowThreshold ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, r.percentage)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        r.isBelowThreshold
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {r.isBelowThreshold ? 'BELOW 75%' : 'ELIGIBLE'}
                    </span>
                  </td>
                  <td className="text-xs">
                    {r.isBelowThreshold ? (
                      <span className="text-rose-700 font-medium">
                        Must attend next <strong>{r.classesNeededToCatchUp}</strong> consecutive class(es) to regain 75%.
                      </span>
                    ) : (
                      <span className="text-slate-600">
                        Up to <strong>{r.permissibleAbsences}</strong> permissible absence(s) remaining without dropping below 75%.
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
