import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { LoadingState } from '../../components/common/LoadingState';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Download,
  History,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

export const TeacherImport: React.FC = () => {
  const [importType, setImportType] = useState<'INTERNAL_MARKS' | 'SEMESTER_RESULTS' | 'ATTENDANCE'>('INTERNAL_MARKS');
  const [csvContent, setCsvContent] = useState('');
  const [filename, setFilename] = useState('import_data.csv');
  const [overwriteConflicts, setOverwriteConflicts] = useState(false);

  // Validation & Commit state
  const [validating, setValidating] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [validationResult, setValidationResult] = useState<any | null>(null);
  const [commitSummary, setCommitSummary] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Past Batches
  const [historyBatches, setHistoryBatches] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res: any = await api.get('/import/history');
      setHistoryBatches(res.batches || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      setValidationResult(null);
      setCommitSummary(null);
      setError(null);
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    window.open(`/api/v1/import/template/${importType}`, '_blank');
  };

  const handleValidate = async () => {
    if (!csvContent.trim()) {
      setError('Please choose a CSV file or paste valid CSV content.');
      return;
    }

    try {
      setValidating(true);
      setError(null);
      setCommitSummary(null);

      const res: any = await api.post('/import/validate', {
        importType,
        csvContent,
      });

      setValidationResult(res.summary);
    } catch (err: any) {
      setError(err.message || 'CSV validation failed.');
      setValidationResult(null);
    } finally {
      setValidating(false);
    }
  };

  const handleCommit = async () => {
    if (!validationResult || !validationResult.rows) return;

    try {
      setCommitting(true);
      setError(null);

      const res: any = await api.post('/import/commit', {
        importType,
        filename,
        validRows: validationResult.rows,
        overwriteConflicts,
      });

      setCommitSummary(res);
      setValidationResult(null);
      setCsvContent('');
      fetchHistory();
    } catch (err: any) {
      setError(err.message || 'Transactional import failed.');
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Authorized Academic Data Import</h1>
          <p className="text-xs text-slate-500 mt-1">
            Bulk ingestion workflow for institutional continuous assessments, semester transcripts, and attendance records
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          Restricted Faculty Workflow
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {commitSummary && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg space-y-1">
          <div className="flex items-center gap-2 font-bold text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Academic Ingestion Successful</span>
          </div>
          <p>{commitSummary.summary}</p>
        </div>
      )}

      {/* 4-Step Ingestion Wizard Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
        {/* Step 1: Ingestion Type & Template */}
        <div>
          <label className="block text-xs font-bold text-navy mb-2 uppercase tracking-wider">
            1. Select Academic Data Category & Template
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setImportType('INTERNAL_MARKS');
                  setValidationResult(null);
                }}
                className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
                  importType === 'INTERNAL_MARKS'
                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Internal Marks (CAT / Assignment)
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportType('SEMESTER_RESULTS');
                  setValidationResult(null);
                }}
                className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
                  importType === 'SEMESTER_RESULTS'
                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Semester Exam Results
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportType('ATTENDANCE');
                  setValidationResult(null);
                }}
                className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
                  importType === 'ATTENDANCE'
                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Attendance Records
              </button>
            </div>

            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Standard CSV Template
            </button>
          </div>
        </div>

        {/* Step 2: Upload CSV File or Paste */}
        <div>
          <label className="block text-xs font-bold text-navy mb-2 uppercase tracking-wider">
            2. Choose File or Paste CSV Text
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
              <UploadCloud className="w-8 h-8 text-blue-600 mb-2" />
              <p className="text-xs font-semibold text-slate-700">Choose CSV File from Computer</p>
              <p className="text-[11px] text-slate-400 mt-1">UTF-8 comma-separated format (.csv)</p>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="mt-3 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <textarea
                value={csvContent}
                onChange={(e) => {
                  setCsvContent(e.target.value);
                  setValidationResult(null);
                }}
                placeholder="Or paste CSV text lines directly here..."
                rows={6}
                className="w-full p-2.5 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Action Button: Validate Dry Run */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleValidate}
            disabled={validating || !csvContent.trim()}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors disabled:opacity-50"
          >
            {validating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Validating Records...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Execute Dry-Run Validation
              </>
            )}
          </button>
        </div>

        {/* Step 3: Validation Preview Table */}
        {validationResult && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-navy">
                  Validation Results: {validationResult.totalRows} Total Row(s)
                </h3>
                <div className="flex items-center gap-3 text-xs mt-1">
                  <span className="text-emerald-700 font-bold">
                    ✓ {validationResult.validRowsCount} Valid
                  </span>
                  {validationResult.invalidRowsCount > 0 && (
                    <span className="text-rose-700 font-bold">
                      ✗ {validationResult.invalidRowsCount} Invalid Errors
                    </span>
                  )}
                  {validationResult.conflictRowsCount > 0 && (
                    <span className="text-amber-700 font-bold">
                      ⚠ {validationResult.conflictRowsCount} Existing Conflicts
                    </span>
                  )}
                </div>
              </div>

              {/* Conflict Override Checkbox */}
              {validationResult.conflictRowsCount > 0 && (
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer bg-amber-50 border border-amber-200 px-3 py-1.5 rounded">
                  <input
                    type="checkbox"
                    checked={overwriteConflicts}
                    onChange={(e) => setOverwriteConflicts(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Overwrite conflicting existing records</span>
                </label>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-lg">
              <table className="table-academic">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Student Reg No</th>
                    <th>Subject Code</th>
                    <th>Data Snapshot</th>
                    <th>Status</th>
                    <th>Diagnostic Details</th>
                  </tr>
                </thead>
                <tbody>
                  {validationResult.rows.map((row: any) => (
                    <tr key={row.rowNumber} className={!row.valid ? 'bg-rose-50/40' : row.conflict ? 'bg-amber-50/30' : ''}>
                      <td className="font-bold text-xs">{row.rowNumber}</td>
                      <td className="font-mono text-xs font-semibold text-blue-700">
                        {row.data.registerNumber || row.data.regNo}
                      </td>
                      <td className="font-mono text-xs">{row.data.subjectCode || row.data.code}</td>
                      <td className="text-xs text-slate-600 truncate max-w-xs">
                        {JSON.stringify(row.data)}
                      </td>
                      <td>
                        {row.valid ? (
                          row.conflict ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              CONFLICT
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              READY
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                            INVALID
                          </span>
                        )}
                      </td>
                      <td className="text-xs text-slate-500">
                        {row.errors.length > 0 && <span className="text-rose-600">{row.errors.join('; ')}</span>}
                        {row.conflict && !row.errors.length && (
                          <span className="text-amber-700">{row.conflictDetails}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Step 4: Transactional Commit Button */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500">
                Transactional write commits valid rows atomically into institutional database with audit trail.
              </span>
              <button
                onClick={handleCommit}
                disabled={committing || validationResult.validRowsCount === 0}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors disabled:opacity-50"
              >
                {committing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Committing Transaction...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Commit Valid Records ({validationResult.validRowsCount})
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Historical Import Batches */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-navy">Past Academic Ingestion Batches</h3>
          </div>
          <span className="text-xs text-slate-500">{historyBatches.length} batch(es) recorded</span>
        </div>

        {historyBatches.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No previous bulk imports recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-academic">
              <thead>
                <tr>
                  <th>Import Date</th>
                  <th>Category</th>
                  <th>Filename</th>
                  <th>Authorized Actor</th>
                  <th>Total Rows</th>
                  <th>Success</th>
                  <th>Errors</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {historyBatches.map((b) => (
                  <tr key={b.id}>
                    <td className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(b.createdAt).toLocaleString()}
                    </td>
                    <td className="font-semibold text-xs text-navy">{b.importType}</td>
                    <td className="font-mono text-xs text-slate-600">{b.filename}</td>
                    <td className="text-xs text-slate-700">{b.actor?.name || 'Faculty User'}</td>
                    <td className="font-bold text-xs">{b.totalRows}</td>
                    <td className="text-xs font-bold text-emerald-700">{b.successRows}</td>
                    <td className="text-xs font-bold text-rose-700">{b.errorRows}</td>
                    <td>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          b.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
