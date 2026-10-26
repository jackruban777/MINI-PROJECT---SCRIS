import React, { useState } from 'react';
import { api } from '../../lib/api';
import { FileSpreadsheet, Download, ShieldCheck, CheckCircle2, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const TeacherReports: React.FC = () => {
  const { user } = useAuth();
  const [downloadingClass, setDownloadingClass] = useState(false);
  const [downloadingAtRisk, setDownloadingAtRisk] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExportClassCSV = async () => {
    setDownloadingClass(true);
    setMessage(null);
    try {
      const blob = await api.get<Blob>('/reports/class-csv');
      downloadFile(blob, `SCRIS_Class_Summary_${user?.department.replace(/\s+/g, '_')}.csv`);
      setMessage('Class summary CSV exported successfully.');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to export class summary.');
    } finally {
      setDownloadingClass(false);
    }
  };

  const handleExportAtRiskCSV = async () => {
    setDownloadingAtRisk(true);
    setMessage(null);
    try {
      const blob = await api.get<Blob>('/reports/at-risk-csv');
      downloadFile(blob, `SCRIS_AtRisk_Roster_${user?.department.replace(/\s+/g, '_')}.csv`);
      setMessage('At-risk roster CSV exported successfully.');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to export at-risk roster.');
    } finally {
      setDownloadingAtRisk(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Academic Reports & Data Export</h1>
          <p className="text-xs text-slate-500 mt-1">
            Department-authorized data exports for committee meetings, accreditation audits, and advisory follow-ups
          </p>
        </div>
        <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Department Scope Enforced: {user?.department}</span>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Class Summary CSV */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-navy">Class Academic Summary (CSV)</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Export complete roster of students within {user?.department} including register number, CGPA, pending arrear counts, composite risk score, and category classification.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Format: UTF-8 CSV</span>
            <button
              onClick={handleExportClassCSV}
              disabled={downloadingClass}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md font-semibold text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              {downloadingClass ? 'Exporting...' : 'Export Class CSV'}
            </button>
          </div>
        </div>

        {/* At-Risk Roster CSV */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-navy">Priority At-Risk Student Roster (CSV)</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Export targeted list of students classified in Watch and Critical tiers, detailing contributing academic factors, arrears, and current intervention statuses for faculty review.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Format: UTF-8 CSV</span>
            <button
              onClick={handleExportAtRiskCSV}
              disabled={downloadingAtRisk}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md font-semibold text-xs text-white bg-navy hover:bg-navy-dark disabled:opacity-50 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              {downloadingAtRisk ? 'Exporting...' : 'Export At-Risk CSV'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
