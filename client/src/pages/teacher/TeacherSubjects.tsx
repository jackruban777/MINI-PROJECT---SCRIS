import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { LoadingState } from '../../components/common/LoadingState';
import { BookMarked, AlertTriangle, CheckCircle, ShieldCheck, Search, Filter, Award } from 'lucide-react';

export const TeacherSubjects: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/teacher/subject-analysis');
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load subject analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  if (loading) return <LoadingState message="Analyzing Anna University course-level academic metrics..." />;
  if (error || !data) {
    return <div className="p-4 bg-rose-50 text-rose-800 rounded">{error}</div>;
  }

  const { subjects, department } = data;

  const filteredSubjects = subjects.filter((sub: any) => {
    const matchesSem = selectedSemester === 'ALL' || sub.semester === selectedSemester;
    const matchesSearch =
      searchQuery.trim() === '' ||
      sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSem && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-navy">Department Course & Subject Analysis</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              Anna University R-2021
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Diagnostic comparison identifying Anna University curriculum subjects with low internal scores, attendance shortfall, or arrear burden
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200">
            {department}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Semester Tabs */}
          <div className="flex items-center flex-wrap gap-1">
            <button
              onClick={() => setSelectedSemester('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                selectedSemester === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Semesters ({subjects.length})
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
              const semCount = subjects.filter((s: any) => s.semester === sem).length;
              return (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    selectedSemester === sem
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Sem {sem} ({semCount})
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search code (e.g. CS3591) or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-navy uppercase tracking-wider">
            Showing {filteredSubjects.length} of {subjects.length} Anna University Courses
          </span>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Read-Only Academic System
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-academic">
            <thead>
              <tr>
                <th>Subject Code & Title</th>
                <th>Semester & Credits</th>
                <th>Internal Average</th>
                <th>Students &lt; 50%</th>
                <th>Avg Attendance</th>
                <th>Attendance Risk (&lt;75%)</th>
                <th>Pending Arrears</th>
                <th>Risk Priority</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-xs text-slate-500">
                    No subjects match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((sub: any) => (
                  <tr key={sub.id}>
                    <td>
                      <span className="font-mono text-xs font-bold text-blue-700 mr-2">{sub.code}</span>
                      <span className="font-semibold text-slate-900 text-xs">{sub.name}</span>
                    </td>
                    <td className="text-xs text-slate-600">
                      Sem {sub.semester} &bull; {sub.credits} Credits
                    </td>
                    <td>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          sub.avgInternal !== null && sub.avgInternal < 55
                            ? 'bg-rose-100 text-rose-800'
                            : sub.avgInternal !== null && sub.avgInternal < 65
                            ? 'bg-amber-100 text-amber-800'
                            : sub.avgInternal !== null
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {sub.avgInternal !== null ? `${sub.avgInternal}%` : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`text-xs font-bold ${
                          sub.subThresholdInternals > 3 ? 'text-rose-600' : 'text-slate-600'
                        }`}
                      >
                        {sub.subThresholdInternals} Students
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-slate-700">
                        {sub.avgAttendance !== null ? `${sub.avgAttendance}%` : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`text-xs font-bold ${
                          sub.attendanceConcerns > 0 ? 'text-amber-600' : 'text-slate-500'
                        }`}
                      >
                        {sub.attendanceConcerns} Students
                      </span>
                    </td>
                    <td>
                      <span
                        className={`text-xs font-bold ${
                          sub.pendingArrearsCount > 0 ? 'text-rose-600' : 'text-slate-500'
                        }`}
                      >
                        {sub.pendingArrearsCount}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          sub.riskLevel === 'HIGH'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : sub.riskLevel === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {sub.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
