import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { LoadingState } from '../../components/common/LoadingState';
import { RiskBadge } from '../../components/common/RiskBadge';
import { Modal } from '../../components/common/Modal';
import { AlertTriangle, ShieldAlert, PlusCircle, CheckCircle2, Clock, Target, ArrowRight } from 'lucide-react';

export const TeacherAtRisk: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Intervention Modal State
  const [activeStudentForIntervention, setActiveStudentForIntervention] = useState<any | null>(null);
  const [interventionType, setInterventionType] = useState('Academic Counselling');
  const [interventionNotes, setInterventionNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interventionSuccessMsg, setInterventionSuccessMsg] = useState<string | null>(null);

  const fetchAtRisk = async () => {
    try {
      const res = await api.get('/teacher/at-risk');
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load at-risk students roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAtRisk();
  }, []);

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudentForIntervention) return;
    setIsSubmitting(true);
    try {
      await api.post('/teacher/interventions', {
        studentId: activeStudentForIntervention.studentId,
        type: interventionType,
        notes: interventionNotes,
        followUpDate: followUpDate || undefined,
      });

      setInterventionSuccessMsg(`Intervention plan initiated for ${activeStudentForIntervention.name}`);
      setTimeout(() => setInterventionSuccessMsg(null), 4000);
      setActiveStudentForIntervention(null);
      setInterventionNotes('');
      setFollowUpDate('');
      // Refresh list
      fetchAtRisk();
    } catch (err: any) {
      alert(err.message || 'Failed to register intervention');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Prioritizing at-risk students according to risk engine calculations..." />;
  if (error || !data) {
    return <div className="p-4 bg-rose-50 text-rose-800 rounded">{error}</div>;
  }

  const { atRiskStudents, totalAtRisk, criticalCount, watchCount } = data;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Priority At-Risk Student Roster</h1>
          <p className="text-xs text-slate-500 mt-1">
            Prioritized support queue ranking students by continuous risk scores (Watch & Critical categories)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
            {criticalCount} Critical Priority
          </span>
          <span className="px-3 py-1.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            {watchCount} Watch List
          </span>
        </div>
      </div>

      {interventionSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{interventionSuccessMsg}</span>
        </div>
      )}

      {/* Prioritized Cards List */}
      <div className="space-y-4">
        {atRiskStudents.map((s: any, rank: number) => {
          const isCritical = s.category === 'CRITICAL';
          const activeInterventions = s.interventions.filter((i: any) => i.status !== 'RESOLVED');

          return (
            <div
              key={s.studentId}
              className={`bg-white border rounded-lg p-5 shadow-sm transition-all ${
                isCritical ? 'border-rose-300' : 'border-amber-300'
              }`}
            >
              {/* Top Row: Rank, Student Identity, Risk Badge & Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      isCritical ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    #{rank + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-navy">{s.name}</h3>
                      <span className="font-mono text-xs font-bold text-blue-700">({s.registerNumber})</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {s.department} &bull; Semester {s.currentSemester} (Sec {s.section})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <RiskBadge category={s.category} score={s.score} size="md" />
                  <button
                    onClick={() => setActiveStudentForIntervention(s)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Initiate Intervention
                  </button>
                </div>
              </div>

              {/* Middle Row: Diagnostic explanation */}
              <div className="my-3 p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-navy">Contributing Factors: </span>
                {s.explanation}
              </div>

              {/* Factors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 text-xs">
                <div className="p-2.5 bg-white border border-slate-200 rounded">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Pending Arrears</p>
                  <p className="text-sm font-bold text-amber-700 mt-0.5">
                    {s.pendingArrears.length > 0 ? `${s.pendingArrears.length} Arrear(s)` : 'None'}
                  </p>
                  {s.pendingArrears.length > 0 && (
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {s.pendingArrears.map((a: any) => a.subject.code).join(', ')}
                    </p>
                  )}
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Highest Risk Course</p>
                  <p className="text-sm font-bold text-navy mt-0.5 truncate">
                    {s.subjectFocus[0]?.name || 'N/A'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {s.subjectFocus[0]?.recommendedAction || 'Monitor progress'}
                  </p>
                </div>

                <div className="p-2.5 bg-white border border-slate-200 rounded">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Intervention Status</p>
                  <p className="text-sm font-bold text-blue-700 mt-0.5">
                    {activeInterventions.length > 0
                      ? `${activeInterventions.length} Active Plan(s)`
                      : 'Needs Intervention'}
                  </p>
                  {activeInterventions.length > 0 && (
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Type: {activeInterventions[0].type}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Intervention Modal */}
      <Modal
        isOpen={!!activeStudentForIntervention}
        onClose={() => setActiveStudentForIntervention(null)}
        title={`Initiate Academic Intervention — ${activeStudentForIntervention?.name}`}
        maxWidth="lg"
      >
        <form onSubmit={handleCreateIntervention} className="space-y-4 text-xs">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-slate-700">
            <p className="font-semibold text-navy">
              Target Student: {activeStudentForIntervention?.name} ({activeStudentForIntervention?.registerNumber})
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Current Risk: {activeStudentForIntervention?.category} (Index: {activeStudentForIntervention?.score}/100)
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Intervention Strategy
            </label>
            <select
              value={interventionType}
              onChange={(e) => setInterventionType(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="Academic Counselling">Academic Counselling (1-on-1 advisor session)</option>
              <option value="Remedial Classes">Remedial Classes (Scheduled problem solving)</option>
              <option value="Mentor Meeting">Mentor Meeting (Peer/Senior tutor support)</option>
              <option value="Study-plan Review">Study-plan Review (Timetable & backlog clearance plan)</option>
              <option value="Parent/Guardian Meeting">Parent/Guardian Meeting (Institutional conference)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Advisory Notes & Prescribed Action
            </label>
            <textarea
              required
              rows={3}
              value={interventionNotes}
              onChange={(e) => setInterventionNotes(e.target.value)}
              placeholder="Specify the learning difficulty, subject focus target, and agreed action steps..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Follow-Up Review Date (Optional)
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveStudentForIntervention(null)}
              className="px-4 py-2 border border-slate-300 rounded-md text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Register Intervention Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
