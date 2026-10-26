import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  Award,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { api } from '../../lib/api';
import { StatCard } from '../../components/common/StatCard';
import { RiskBadge } from '../../components/common/RiskBadge';
import { LoadingState } from '../../components/common/LoadingState';

export const TeacherDashboard: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/teacher/dashboard');
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load faculty dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingState message="Loading department academic analytics..." />;
  if (error || !data) {
    return <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded">{error}</div>;
  }

  const { department, metrics, atRiskPriority, recentInterventions, upcomingExams } = data;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-navy">Faculty Academic Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
              {department}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Class monitoring, at-risk student prioritization, and active academic interventions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/teacher/at-risk"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-rose-600 text-xs font-semibold rounded text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            At-Risk Roster ({metrics.criticalCount + metrics.watchCount})
          </Link>
          <Link
            to="/teacher/reports"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 text-xs font-semibold rounded text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
          >
            Export Reports
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Students"
          value={metrics.totalStudents}
          subtitle={`Department: ${department}`}
          icon={Users}
          variant="primary"
        />

        <StatCard
          title="Critical Risk Students"
          value={metrics.criticalCount}
          subtitle={`Score 65–100 &bull; Urgent Support`}
          icon={ShieldAlert}
          variant="danger"
        />

        <StatCard
          title="Watch Category"
          value={metrics.watchCount}
          subtitle={`Score 35–64 &bull; Early Warning`}
          icon={AlertTriangle}
          variant="warning"
        />

        <StatCard
          title="Department Average CGPA"
          value={metrics.averageCgpa > 0 ? `${metrics.averageCgpa.toFixed(2)}` : 'N/A'}
          subtitle={`Total Pending Arrears: ${metrics.totalPendingArrears}`}
          icon={Award}
          variant="success"
        />
      </div>

      {/* Risk Distribution Breakdown Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Department Risk Category Distribution
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg text-center">
            <span className="text-2xl font-extrabold text-emerald-800">{metrics.safeCount}</span>
            <p className="text-xs font-semibold text-emerald-700 mt-1">Safe Category (0–34)</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">
              {metrics.totalStudents > 0 ? ((metrics.safeCount / metrics.totalStudents) * 100).toFixed(0) : 0}% of cohort
            </p>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg text-center">
            <span className="text-2xl font-extrabold text-amber-800">{metrics.watchCount}</span>
            <p className="text-xs font-semibold text-amber-700 mt-1">Watch Category (35–64)</p>
            <p className="text-[11px] text-amber-600 mt-0.5">
              {metrics.totalStudents > 0 ? ((metrics.watchCount / metrics.totalStudents) * 100).toFixed(0) : 0}% of cohort
            </p>
          </div>

          <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-lg text-center">
            <span className="text-2xl font-extrabold text-rose-800">{metrics.criticalCount}</span>
            <p className="text-xs font-semibold text-rose-700 mt-1">Critical Category (65–100)</p>
            <p className="text-[11px] text-rose-600 mt-0.5">
              {metrics.totalStudents > 0 ? ((metrics.criticalCount / metrics.totalStudents) * 100).toFixed(0) : 0}% of cohort
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Prioritized At-Risk Students and Interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prioritized At-Risk Students Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-navy flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Priority Students Requiring Intervention
              </h2>
              <p className="text-[11px] text-slate-500">Sorted by highest composite academic risk score</p>
            </div>
            <Link to="/teacher/at-risk" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {atRiskPriority.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-500">No students currently flagged in Watch or Critical.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-academic">
                <thead>
                  <tr>
                    <th>Student Details</th>
                    <th>Semester</th>
                    <th>Pending Arrears</th>
                    <th>Risk Category</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {atRiskPriority.map((s: any) => (
                    <tr key={s.id}>
                      <td>
                        <span className="font-mono text-xs font-bold text-blue-700">{s.registerNumber}</span>
                        <p className="font-semibold text-slate-900 text-xs">{s.name}</p>
                      </td>
                      <td className="text-xs text-slate-600">Sem {s.currentSemester} ({s.section})</td>
                      <td className="text-xs font-semibold">
                        <span className={s.pendingArrearsCount > 0 ? 'text-amber-700' : 'text-slate-500'}>
                          {s.pendingArrearsCount} Arrear(s)
                        </span>
                      </td>
                      <td>
                        <RiskBadge category={s.category} score={s.score} size="sm" />
                      </td>
                      <td>
                        <Link
                          to={`/teacher/students?search=${s.registerNumber}`}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Recent Interventions & Exams */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Interventions */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h2 className="text-sm font-bold text-navy flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                Active Student Interventions
              </h2>
              <Link to="/teacher/interventions" className="text-xs text-blue-600 hover:underline">Manage</Link>
            </div>

            {recentInterventions.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No active interventions in this department.</p>
            ) : (
              <div className="space-y-3">
                {recentInterventions.map((inv: any) => (
                  <div key={inv.id} className="p-3 border border-slate-200 rounded text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-navy">{inv.student.user.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-blue-700 font-medium text-[11px]">{inv.type}</p>
                    <p className="text-slate-600 mt-1 line-clamp-2">{inv.notes}</p>
                    {inv.followUpDate && (
                      <p className="text-[10px] text-slate-400 mt-1">
                        Follow-up: {new Date(inv.followUpDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Department Examinations */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h2 className="text-sm font-bold text-navy flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                Scheduled Examinations
              </h2>
              <Link to="/teacher/timetable" className="text-xs text-blue-600 hover:underline">Timetable</Link>
            </div>

            {upcomingExams.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No upcoming exams scheduled.</p>
            ) : (
              <div className="space-y-2">
                {upcomingExams.map((e: any) => (
                  <div key={e.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-navy">{e.subject?.name || e.description}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {e.startTime} - {e.endTime} &bull; Room: {e.room}
                      </p>
                    </div>
                    <span className="font-bold text-blue-700 bg-white border border-blue-200 px-2 py-1 rounded text-[10px]">
                      {new Date(e.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
