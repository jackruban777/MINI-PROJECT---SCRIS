import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { LoadingState } from '../../components/common/LoadingState';
import {
  FileText,
  Filter,
  ShieldAlert,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Database,
  ArrowRight,
} from 'lucide-react';

export const TeacherAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (entityFilter) queryParams.append('entityType', entityFilter);
      if (actionFilter) queryParams.append('action', actionFilter);

      const res: any = await api.get(`/teacher/audit-logs?${queryParams.toString()}`);
      setLogs(res.logs || []);
      setTotalCount(res.totalCount || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entityFilter, actionFilter]);

  if (loading && logs.length === 0) return <LoadingState message="Loading secure institutional audit trail..." />;

  const filteredLogs = logs.filter((log) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      log.actor?.name.toLowerCase().includes(term) ||
      log.actor?.email.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      log.entityType.toLowerCase().includes(term) ||
      (log.metadata && log.metadata.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Institutional Security & Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable, read-only event log capturing administrative actions, academic imports, advisor assignments, and report generation
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-700 self-start sm:self-auto">
          <Database className="w-4 h-4 text-slate-600" />
          Tamper-Evident System Log
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">{error}</div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white text-navy focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Entity Types</option>
            <option value="Intervention">Intervention</option>
            <option value="Student">Student (Advisor Assignment)</option>
            <option value="AcademicImportBatch">Academic Ingestion</option>
            <option value="SystemSetting">System Configuration</option>
            <option value="Report">Report Export</option>
            <option value="InstitutionalSyncLog">Institutional Sync</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white text-navy focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="ASSIGN_ADVISOR">ASSIGN_ADVISOR</option>
            <option value="IMPORT_ACADEMIC_DATA">IMPORT_ACADEMIC_DATA</option>
            <option value="UPDATE_SYSTEM_SETTINGS">UPDATE_SYSTEM_SETTINGS</option>
            <option value="EXPORT_PDF_REPORT">EXPORT_PDF_REPORT</option>
            <option value="EXPORT_INTERVENTIONS_CSV">EXPORT_INTERVENTIONS_CSV</option>
            <option value="TRIGGER_SIS_SYNC">TRIGGER_SIS_SYNC</option>
          </select>

          {(entityFilter || actionFilter) && (
            <button
              onClick={() => {
                setEntityFilter('');
                setActionFilter('');
              }}
              className="text-xs text-blue-600 hover:underline px-2 py-1"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-navy">Audit Log Stream ({filteredLogs.length} Records)</h3>
          </div>
          <span className="text-xs text-slate-500">Total Events: {totalCount}</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No audit log entries match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-academic">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Role</th>
                  <th>Entity Scope</th>
                  <th>Action</th>
                  <th>Entity Reference</th>
                  <th>Provenance Metadata</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const isCreate = log.action === 'CREATE' || log.action === 'IMPORT_ACADEMIC_DATA';
                  const isAssign = log.action === 'ASSIGN_ADVISOR';
                  const isSettings = log.action === 'UPDATE_SYSTEM_SETTINGS';

                  return (
                    <tr key={log.id}>
                      <td className="text-xs text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="font-semibold text-xs text-navy whitespace-nowrap">
                        {log.actor?.name || 'System Process'}
                        <span className="text-[10px] text-slate-400 block font-normal">
                          {log.actor?.email}
                        </span>
                      </td>
                      <td>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {log.actor?.role || 'SYSTEM'}
                        </span>
                      </td>
                      <td className="font-semibold text-xs text-slate-700">{log.entityType}</td>
                      <td>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isCreate
                              ? 'bg-emerald-100 text-emerald-800'
                              : isAssign
                              ? 'bg-blue-100 text-blue-800'
                              : isSettings
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-slate-500">{log.entityId}</td>
                      <td className="text-xs font-mono text-slate-600 max-w-sm truncate" title={log.metadata || ''}>
                        {log.metadata || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
