import React, { useState } from 'react';
import { api } from '../../lib/api';
import { FileText, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const StudentReports: React.FC = () => {
  const { user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    setError(null);
    try {
      const blob = await api.get<Blob>('/reports/student-pdf');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SCRIS_Academic_Report_${user?.studentProfile?.registerNumber || 'Student'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to download academic report.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-xl font-bold text-navy">Official Academic Progress Reports</h1>
        <p className="text-xs text-slate-500 mt-1">
          Generate, verify, and export your authenticated academic standing and risk evaluation transcript
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
          {error}
        </div>
      )}

      {downloadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Academic report PDF generated and downloaded successfully.</span>
        </div>
      )}

      {/* Document Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-600">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-navy">Semester Progress & Risk Audit Report (PDF)</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                OFFICIAL TRANSCRIPT
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
              Contains your complete verified academic profile: CGPA, credits earned, subject-wise internal assessment averages, attendance status, arrear history, and individualized faculty recommendations.
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Cryptographically Authorized
              </span>
              <span>Format: Standard A4 PDF</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-semibold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          {isDownloading ? 'Generating PDF...' : 'Download PDF Report'}
        </button>
      </div>

      {/* Report Inclusions Summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-xs text-slate-600">
        <h4 className="font-bold text-navy text-xs uppercase tracking-wider mb-2">
          Report Inclusions & Verification Standards
        </h4>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
          <li className="flex items-center gap-1.5">&bull; Personal student identifier and degree registration</li>
          <li className="flex items-center gap-1.5">&bull; 10-point scale CGPA and semester SGPA records</li>
          <li className="flex items-center gap-1.5">&bull; Continuous assessment marks (CAT-1, CAT-2, Assignments)</li>
          <li className="flex items-center gap-1.5">&bull; 5-factor academic risk engine score and diagnosis</li>
          <li className="flex items-center gap-1.5">&bull; Official attendance record against 75% requirement</li>
          <li className="flex items-center gap-1.5">&bull; Actionable academic targets and advisor notes</li>
        </ul>
      </div>
    </div>
  );
};
