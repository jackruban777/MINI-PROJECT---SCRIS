import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { LoadingState } from '../../components/common/LoadingState';
import { Settings, ShieldCheck, Info, CheckCircle2, RefreshCw, Save, BellRing } from 'lucide-react';

export const TeacherSettings: React.FC = () => {
  const [settingsData, setSettingsData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reassessing, setReassessing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [reassessmentResult, setReassessmentResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editable rules state
  const [internalWeight, setInternalWeight] = useState('40');
  const [examWeight, setExamWeight] = useState('60');
  const [passingThreshold, setPassingThreshold] = useState('50');
  const [examMinimum, setExamMinimum] = useState('45');
  const [attendanceCutoff, setAttendanceCutoff] = useState('75');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/teacher/settings');
      setSettingsData(res);

      if (res.customSettings) {
        if (res.customSettings['INTERNAL_WEIGHT']) setInternalWeight(res.customSettings['INTERNAL_WEIGHT']);
        if (res.customSettings['EXAM_WEIGHT']) setExamWeight(res.customSettings['EXAM_WEIGHT']);
        if (res.customSettings['PASSING_THRESHOLD']) setPassingThreshold(res.customSettings['PASSING_THRESHOLD']);
        if (res.customSettings['EXAM_MINIMUM_THRESHOLD']) setExamMinimum(res.customSettings['EXAM_MINIMUM_THRESHOLD']);
        if (res.customSettings['ATTENDANCE_THRESHOLD']) setAttendanceCutoff(res.customSettings['ATTENDANCE_THRESHOLD']);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveSuccess(null);
      setError(null);

      await api.put('/teacher/settings', {
        settings: {
          INTERNAL_WEIGHT: internalWeight,
          EXAM_WEIGHT: examWeight,
          PASSING_THRESHOLD: passingThreshold,
          EXAM_MINIMUM_THRESHOLD: examMinimum,
          ATTENDANCE_THRESHOLD: attendanceCutoff,
        },
      });

      setSaveSuccess('Institutional rules updated and logged to audit trail.');
      setTimeout(() => setSaveSuccess(null), 4000);
      fetchSettings();
    } catch (err: any) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerReassessment = async () => {
    try {
      setReassessing(true);
      setReassessmentResult(null);
      const res: any = await api.post('/teacher/notifications/trigger-reassessment', {});
      setReassessmentResult(res.message);
    } catch (err: any) {
      setError(err.message || 'Reassessment failed.');
    } finally {
      setReassessing(false);
    }
  };

  if (loading) return <LoadingState message="Loading institutional configuration parameters..." />;
  if (error && !settingsData) return <div className="p-4 bg-rose-50 text-rose-800 rounded">{error}</div>;

  const { weights, thresholds } = settingsData;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Institutional Governance & System Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configurable academic passing thresholds, risk factor weights, and automated evaluation triggers
          </p>
        </div>

        <button
          onClick={handleTriggerReassessment}
          disabled={reassessing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <BellRing className={`w-3.5 h-3.5 ${reassessing ? 'animate-spin' : ''}`} />
          {reassessing ? 'Reassessing Department...' : 'Run Department Risk Reassessment'}
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {reassessmentResult && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>{reassessmentResult}</span>
        </div>
      )}

      {/* Info Notice */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-slate-700 flex items-start gap-2.5">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-semibold text-navy">Engine Transparency & Institutional Audit Guarantee:</p>
          <p className="mt-0.5">
            Risk scores (0–100) are computed deterministically by the backend using these institutional constants.
            All parameter modifications are permanently logged to the system audit trail with actor provenance.
          </p>
        </div>
      </div>

      {/* Configurable Institutional Rules Form */}
      <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider">
              Configurable Institutional Passing & Grading Rules
            </h3>
            <p className="text-xs text-slate-500">
              Modify assessment weights and pass thresholds applied across student calculators and evaluation reports
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving Changes...' : 'Save Configuration'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Weight (%)
            </label>
            <input
              type="number"
              min="10"
              max="60"
              value={internalWeight}
              onChange={(e) => setInternalWeight(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded font-bold text-navy focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
            <span className="text-[10px] text-slate-400">Continuous Assessment</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Exam Weight (%)
            </label>
            <input
              type="number"
              min="40"
              max="90"
              value={examWeight}
              onChange={(e) => setExamWeight(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded font-bold text-navy focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
            <span className="text-[10px] text-slate-400">Semester Exam Weight</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pass Cutoff (%)
            </label>
            <input
              type="number"
              min="40"
              max="60"
              value={passingThreshold}
              onChange={(e) => setPassingThreshold(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded font-bold text-navy focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
            <span className="text-[10px] text-slate-400">Composite Pass Mark</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Exam Min Cutoff (%)
            </label>
            <input
              type="number"
              min="35"
              max="50"
              value={examMinimum}
              onChange={(e) => setExamMinimum(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded font-bold text-navy focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
            <span className="text-[10px] text-slate-400">Mandatory Paper Min</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Attendance Cutoff (%)
            </label>
            <input
              type="number"
              min="65"
              max="85"
              value={attendanceCutoff}
              onChange={(e) => setAttendanceCutoff(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded font-bold text-navy focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
            <span className="text-[10px] text-slate-400">Exam Hall Ticket Eligibility</span>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Factor Weights Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-bold text-navy uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
            Component Factor Weights (Sum = 100%)
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="font-semibold text-slate-700">Internal Academic Performance (CAT/Assessments)</span>
              <span className="font-bold font-mono text-blue-700">{(weights.internalMarks * 100).toFixed(0)}%</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="font-semibold text-slate-700">Pending Course Arrear Burden</span>
              <span className="font-bold font-mono text-blue-700">{(weights.pendingArrears * 100).toFixed(0)}%</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="font-semibold text-slate-700">Cumulative GPA & Semester History</span>
              <span className="font-bold font-mono text-blue-700">{(weights.cgpaTrend * 100).toFixed(0)}%</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="font-semibold text-slate-700">Class Attendance Adherence</span>
              <span className="font-bold font-mono text-blue-700">{(weights.attendance * 100).toFixed(0)}%</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="font-semibold text-slate-700">Sub-Threshold & Missed Assessments</span>
              <span className="font-bold font-mono text-blue-700">{(weights.missedAssessments * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Thresholds and Boundaries */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-bold text-navy uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
            Classification Thresholds & Scale
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 border border-emerald-200 bg-emerald-50/50 rounded flex justify-between items-center">
              <div>
                <p className="font-bold text-emerald-800">Safe Category</p>
                <p className="text-[11px] text-emerald-700">Normal academic course completion trajectory</p>
              </div>
              <span className="font-mono font-bold text-emerald-800 text-sm">0 &ndash; {thresholds.safeMax}</span>
            </div>

            <div className="p-3 border border-amber-200 bg-amber-50/50 rounded flex justify-between items-center">
              <div>
                <p className="font-bold text-amber-800">Watch Category</p>
                <p className="text-[11px] text-amber-700">Early faculty advisory intervention advised</p>
              </div>
              <span className="font-mono font-bold text-amber-800 text-sm">
                {thresholds.safeMax + 1} &ndash; {thresholds.watchMax}
              </span>
            </div>

            <div className="p-3 border border-rose-200 bg-rose-50/50 rounded flex justify-between items-center">
              <div>
                <p className="font-bold text-rose-800">Critical Category</p>
                <p className="text-[11px] text-rose-700">Urgent formal support required</p>
              </div>
              <span className="font-mono font-bold text-rose-800 text-sm">{thresholds.watchMax + 1} &ndash; 100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
