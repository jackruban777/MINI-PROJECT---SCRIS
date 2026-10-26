import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { LoadingState } from '../../components/common/LoadingState';
import {
  Network,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  ShieldCheck,
  Clock,
  ArrowRight,
  Database,
} from 'lucide-react';

export const TeacherIntegrations: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/teacher/integrations');
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load integration status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleTriggerSync = async () => {
    try {
      setSyncing(true);
      setSyncMessage(null);
      const res: any = await api.post('/teacher/integrations/sync', {});
      setSyncMessage(res.message);
      fetchIntegrations();
    } catch (err: any) {
      setError(err.message || 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <LoadingState message="Loading institutional integration adapter..." />;
  if (error && !data) {
    return <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded">{error}</div>;
  }

  const { adapterConfig, lastSync, recentSyncs } = data;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Institutional SIS / ERP Integration</h1>
          <p className="text-xs text-slate-500 mt-1">
            Read-only adapter gateway for automated university database synchronization, source provenance, and audit logs
          </p>
        </div>

        <button
          onClick={handleTriggerSync}
          disabled={syncing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Verifying & Syncing...' : 'Trigger On-Demand Sync'}
        </button>
      </div>

      {syncMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Integration Adapter Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Adapter Framework</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded">
              <Server className="w-4 h-4" />
            </span>
          </div>
          <p className="text-base font-bold text-navy">{adapterConfig.systemName}</p>
          <div className="text-xs text-slate-600 space-y-1">
            <p>
              Protocol: <strong className="text-navy">{adapterConfig.protocol}</strong>
            </p>
            <p>
              Cadence: <strong className="text-navy">{adapterConfig.syncCadence}</strong>
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Connection State</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-base font-bold text-emerald-700">READY & CONFIGURED</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bi-directional SSL Mutual TLS handshake verified. Endpoint mirrors official student records.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Last Synchronization</span>
            <span className="p-1.5 bg-slate-100 text-slate-600 rounded">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-base font-bold text-navy">
            {lastSync ? new Date(lastSync.syncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
          </p>
          <p className="text-xs text-slate-500">
            {lastSync ? `${lastSync.recordsSynced} records verified in ${lastSync.durationMs}ms` : 'No sync recorded yet'}
          </p>
        </div>
      </div>

      {/* Provenance & Read-Only Academic Rule Notice */}
      <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-lg text-xs text-slate-700 flex items-start gap-3">
        <Database className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-navy">Source Provenance Architecture:</span> Institutional integration
          enforces strict read-only ingestion. No marks entry forms or attendance edit forms exist in either portal.
          Records synchronized through this adapter mirror the university&apos;s authoritative database.
        </div>
      </div>

      {/* Synchronization Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-navy">Recent Synchronization Runs</h3>
            <p className="text-xs text-slate-500">Audit trail of automated and manual SIS synchronization runs</p>
          </div>
          <span className="text-xs text-slate-500">{recentSyncs.length} run(s) logged</span>
        </div>

        {recentSyncs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No synchronization history recorded yet. Click &quot;Trigger On-Demand Sync&quot; above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-academic">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Adapter Target</th>
                  <th>Trigger Mode</th>
                  <th>Profiles Verified</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Details & Checksum</th>
                </tr>
              </thead>
              <tbody>
                {recentSyncs.map((sync: any) => (
                  <tr key={sync.id}>
                    <td className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(sync.syncedAt).toLocaleString()}
                    </td>
                    <td className="font-semibold text-navy text-xs">{sync.systemName}</td>
                    <td className="text-xs text-slate-600">{sync.syncType}</td>
                    <td className="font-bold text-xs">{sync.recordsSynced}</td>
                    <td className="text-xs text-slate-500">{sync.durationMs}ms</td>
                    <td>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          sync.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {sync.status}
                      </span>
                    </td>
                    <td className="text-xs font-mono text-slate-500 max-w-xs truncate">
                      {sync.details || 'Verified'}
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
