import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { LoadingState } from '../../components/common/LoadingState';
import { Award, Info, FileSpreadsheet, TrendingUp, History, ShieldAlert } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const StudentResults: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [historyData, setHistoryData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'transcripts' | 'trends'>('transcripts');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const [res, hist]: [any, any] = await Promise.all([
          api.get('/student/results'),
          api.get('/student/academic-history'),
        ]);
        setData(res);
        setHistoryData(hist);
      } catch (err: any) {
        setError(err.message || 'Failed to load semester results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) return <LoadingState message="Loading semester examination results and history..." />;
  if (error || !data) {
    return <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded">{error}</div>;
  }

  const { semesters, overall } = data;
  const trendPoints = historyData?.trendPoints || [];
  const interventions = historyData?.interventions || [];

  return (
    <div className="space-y-6">
      {/* Header with CGPA Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Semester Examination Results</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete semester-wise examination transcripts and cumulative grade classification
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-slate-500">Cumulative GPA</p>
            <p className="text-2xl font-black text-navy">{overall.cgpa.toFixed(2)} / 10.0</p>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-600">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Institutional Grading Explanation Note */}
      <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg text-xs text-slate-700 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-navy">Grading Scheme & SGPA Formula:</span> Standard 10-point scale
          where O=10, A+=9, A=8, B+=7, B=6, C=5, RA/U=0 (Re-appear/Arrear).
          <code className="ml-1 px-1.5 py-0.5 bg-white border border-blue-200 rounded font-mono text-[11px] text-blue-800">
            SGPA = &Sigma;(Credits &times; Grade Point) / &Sigma;(Credits)
          </code>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setViewTab('transcripts')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            viewTab === 'transcripts'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Semester Transcripts
        </button>
        <button
          onClick={() => setViewTab('trends')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            viewTab === 'trends'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Academic Trend History ({trendPoints.length} Semesters)
        </button>
      </div>

      {viewTab === 'trends' ? (
        <div className="space-y-6">
          {/* Recharts SGPA & CGPA Trend Progression */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-navy">SGPA vs CGPA Progression Trajectory</h3>
              <p className="text-xs text-slate-500">Historical performance across completed academic semesters</p>
            </div>

            {trendPoints.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No historical semester trends available yet.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendPoints} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="semester" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '11px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="sgpa"
                      name="Semester SGPA"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cgpa"
                      name="Cumulative CGPA"
                      stroke="#059669"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Historical Interventions */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-bold text-navy">Historical Academic Interventions & Advisory Support</h3>
            </div>
            {interventions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No formal interventions recorded in academic file.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-academic">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Advisor</th>
                      <th>Status</th>
                      <th>Action Notes</th>
                      <th>Recorded Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interventions.map((item: any) => (
                      <tr key={item.id}>
                        <td className="text-xs text-slate-500 whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="font-semibold text-navy text-xs">{item.type}</td>
                        <td className="text-xs text-slate-700">{item.staff?.user?.name || 'Faculty'}</td>
                        <td>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              item.status === 'RESOLVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="text-xs text-slate-600 max-w-xs truncate">{item.notes}</td>
                        <td className="text-xs text-slate-500">{item.outcome || 'In Progress'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : semesters.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-sm text-slate-500">
          No semester examination results have been published yet.
        </div>
      ) : (
        <div className="space-y-6">
          {semesters.map((sem: any) => (
            <div key={sem.semester} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-navy">Semester {sem.semester}</h3>
                  <span className="text-xs text-slate-500">
                    ({sem.earnedCredits} / {sem.totalCredits} Credits Cleared)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">Semester SGPA:</span>
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-white border border-slate-200 text-blue-700 shadow-sm">
                    {sem.sgpa.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="table-academic">
                  <thead>
                    <tr>
                      <th>Subject Code</th>
                      <th>Course Title</th>
                      <th>Credits</th>
                      <th>Grade</th>
                      <th>Grade Point</th>
                      <th>Attempt</th>
                      <th>Result Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sem.courses.map((course: any) => (
                      <tr key={course.id}>
                        <td className="font-mono font-bold text-blue-700 text-xs">{course.subject.code}</td>
                        <td className="font-semibold text-slate-800">{course.subject.name}</td>
                        <td className="text-slate-600">{course.credits}</td>
                        <td>
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-xs border ${
                              course.grade === 'O' || course.grade === 'A+'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : course.grade === 'RA'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {course.grade}
                          </span>
                        </td>
                        <td className="font-semibold text-slate-700">{course.gradePoint}</td>
                        <td className="text-slate-500 text-xs">Attempt #{course.attemptNumber}</td>
                        <td>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              course.status === 'PASS'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {course.status}
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

