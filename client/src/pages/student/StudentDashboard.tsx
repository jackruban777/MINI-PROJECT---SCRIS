import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  AlertTriangle,
  CalendarCheck,
  Award,
  Calendar,
  ArrowRight,
  TrendingUp,
  Clock,
  Bell,
  CheckCircle,
} from 'lucide-react';
import { api } from '../../lib/api';
import { StatCard } from '../../components/common/StatCard';
import { RiskBadge } from '../../components/common/RiskBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { PredefinedDataBanner } from '../../components/common/PredefinedDataBanner';

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/student/dashboard');
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <LoadingState message="Loading your academic performance records..." />;
  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm">
        Error loading dashboard: {error}
      </div>
    );
  }

  const { student, summary, risk, subjectFocus, upcomingExams, recentNotifications } = data;

  return (
    <div className="space-y-6">
      {/* Interactive Predefined Data & Risk Preset Switcher */}
      <PredefinedDataBanner onRefresh={fetchDashboard} currentRiskCategory={risk.category} />

      {/* Student Welcome Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-navy">{student.name}</h1>
            <RiskBadge category={risk.category} score={risk.score} size="md" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Register No: <span className="font-semibold text-slate-700">{student.registerNumber}</span> &bull;{' '}
            {student.degree} &bull; Semester {student.currentSemester} (Sec {student.section})
          </p>
          {student.advisor && (
            <p className="text-xs text-slate-600 mt-1">
              Faculty Advisor:{' '}
              <span className="font-medium text-navy">{student.advisor.name}</span> ({student.advisor.email})
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/student/reports"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-blue-600 text-xs font-semibold rounded text-blue-600 bg-white hover:bg-blue-50 transition-colors shadow-sm"
          >
            Download Academic Report
          </Link>
        </div>
      </div>

      {/* Summary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cumulative CGPA"
          value={summary.cgpa > 0 ? `${summary.cgpa.toFixed(2)} / 10` : 'N/A'}
          subtitle={`Earned Credits: ${summary.totalCreditsEarned}`}
          icon={Award}
          variant="primary"
        />

        <StatCard
          title="Attendance Status"
          value={summary.overallAttendance !== null ? `${summary.overallAttendance}%` : 'N/A'}
          subtitle={`Required Minimum: ${summary.attendanceThreshold}%`}
          icon={CalendarCheck}
          variant={summary.overallAttendance !== null && summary.overallAttendance < summary.attendanceThreshold ? 'danger' : 'success'}
        />

        <StatCard
          title="Pending Arrears"
          value={summary.pendingArrearsCount}
          subtitle={summary.pendingArrearsCount === 0 ? 'Clear academic standing' : 'Requires supplementary exam'}
          icon={AlertTriangle}
          variant={summary.pendingArrearsCount > 0 ? 'warning' : 'default'}
        />

        <StatCard
          title="Course Completion Risk"
          value={`${risk.score}/100`}
          subtitle={`Status: ${risk.category}`}
          icon={TrendingUp}
          variant={risk.category === 'CRITICAL' ? 'danger' : risk.category === 'WATCH' ? 'warning' : 'success'}
        />
      </div>

      {/* Risk Assessment & Explainable Insights */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-navy">Academic Risk & Course Completion Analysis</h2>
            <p className="text-xs text-slate-500">Transparent factor breakdown calculated from verified records</p>
          </div>
          <RiskBadge category={risk.category} score={risk.score} size="lg" />
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 mb-6 leading-relaxed">
          <p className="font-semibold text-navy mb-1">Diagnostic Summary:</p>
          {risk.explanation}
        </div>

        {/* 5-Factor Weighted Progress Bar Breakdown */}
        <div className="space-y-4 mb-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Factors Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {risk.factors.map((factor: any, idx: number) => (
              <div key={idx} className="p-3 bg-white border border-slate-200 rounded-md">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-navy">{factor.name}</span>
                  <span className="text-slate-500">
                    Weight: {(factor.weight * 100).toFixed(0)}% &bull; Score: {factor.score}/100
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      factor.score > 60 ? 'bg-rose-500' : factor.score > 35 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, factor.score)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-600">{factor.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Recommended Action Steps
          </h3>
          <ul className="space-y-2">
            {risk.recommendations.map((rec: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-blue-50/50 p-2.5 rounded border border-blue-100">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Two Column Section: Subject Focus and Upcoming Dates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Subject Focus Panel */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-base font-bold text-navy">Priority Course Focus</h2>
            <Link to="/student/subject-focus" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {subjectFocus.length === 0 ? (
            <p className="text-xs text-slate-500">No current subjects requiring urgent attention.</p>
          ) : (
            <div className="space-y-3">
              {subjectFocus.map((sub: any) => (
                <div key={sub.subjectId} className="p-3.5 border border-slate-200 rounded-md hover:border-slate-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-700">{sub.code}</span>
                      <h4 className="text-sm font-semibold text-navy">{sub.name}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        sub.riskLevel === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : sub.riskLevel === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {sub.riskLevel} PRIORITY
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
                    <span>Internal Avg: <strong className="text-navy">{sub.internalAverage !== null ? `${sub.internalAverage}%` : 'Pending'}</strong></span>
                    <span>Attendance: <strong className="text-navy">{sub.attendancePercentage !== null ? `${sub.attendancePercentage}%` : 'N/A'}</strong></span>
                    {sub.targetMetric && (
                      <span className="text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                        {sub.targetMetric}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded">
                    {sub.recommendedAction}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Examinations & Academic Alerts */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming Examinations */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-navy flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Upcoming Examinations
              </h2>
              <Link to="/student/timetable" className="text-xs text-blue-600 hover:underline">Timetable</Link>
            </div>

            {upcomingExams.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No examinations scheduled in the next 14 days.</p>
            ) : (
              <div className="space-y-2.5">
                {upcomingExams.map((exam: any) => (
                  <div key={exam.id} className="p-3 border border-slate-200 rounded flex items-start gap-3">
                    <div className="text-center p-1.5 bg-blue-50 border border-blue-200 rounded text-blue-800 min-w-[50px]">
                      <p className="text-[10px] font-bold uppercase">
                        {new Date(exam.examDate).toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                      <p className="text-base font-extrabold leading-none">
                        {new Date(exam.examDate).getDate()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-navy">{exam.subject?.name || exam.description}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {exam.startTime} - {exam.endTime} &bull; Room: {exam.room}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Notifications */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h2 className="text-base font-bold text-navy flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                Recent Academic Alerts
              </h2>
              <Link to="/student/notifications" className="text-xs text-blue-600 hover:underline">All</Link>
            </div>

            {recentNotifications.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No new notifications.</p>
            ) : (
              <div className="space-y-2">
                {recentNotifications.map((n: any) => (
                  <div key={n.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs">
                    <p className="font-semibold text-navy">{n.title}</p>
                    <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
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
