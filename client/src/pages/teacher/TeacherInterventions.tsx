import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { LoadingState } from '../../components/common/LoadingState';
import { Modal } from '../../components/common/Modal';
import { ShieldAlert, PlusCircle, CheckCircle2, Clock, Edit2, Calendar, User, FileText } from 'lucide-react';

export const TeacherInterventions: React.FC = () => {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Update Status Modal
  const [selectedIntervention, setSelectedIntervention] = useState<any | null>(null);
  const [updatedStatus, setUpdatedStatus] = useState('IN_PROGRESS');
  const [updatedPriority, setUpdatedPriority] = useState('MEDIUM');
  const [updatedActionPlan, setUpdatedActionPlan] = useState('');
  const [updatedOutcome, setUpdatedOutcome] = useState('');
  const [updatedNotes, setUpdatedNotes] = useState('');
  const [newProgressNote, setNewProgressNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchInterventions = async () => {
    setLoading(true);
    try {
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get<{ interventions: any[] }>(`/teacher/interventions${query}`);
      setInterventions(res.interventions);
    } catch (err: any) {
      setError(err.message || 'Failed to load interventions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, [statusFilter]);

  const handleOpenEdit = (inv: any) => {
    setSelectedIntervention(inv);
    setUpdatedStatus(inv.status);
    setUpdatedPriority(inv.priority || 'MEDIUM');
    setUpdatedActionPlan(inv.actionPlan || '');
    setUpdatedOutcome(inv.outcome || '');
    setUpdatedNotes(inv.notes || '');
    setNewProgressNote('');
  };

  const handleAddTimelineNote = async () => {
    if (!newProgressNote.trim() || !selectedIntervention) return;
    try {
      setIsAddingNote(true);
      const res: any = await api.post(`/teacher/interventions/${selectedIntervention.id}/notes`, {
        note: newProgressNote.trim(),
      });
      setSelectedIntervention({
        ...selectedIntervention,
        progressNotes: JSON.stringify(res.progressNotes),
      });
      setNewProgressNote('');
      fetchInterventions();
    } catch (err: any) {
      alert(err.message || 'Failed to add progress note');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntervention) return;
    setIsUpdating(true);
    try {
      await api.put(`/teacher/interventions/${selectedIntervention.id}`, {
        status: updatedStatus,
        priority: updatedPriority,
        actionPlan: updatedActionPlan,
        outcome: updatedOutcome,
        notes: updatedNotes,
      });

      setSuccessMsg('Intervention record and outcome updated.');
      setTimeout(() => setSuccessMsg(null), 3000);
      setSelectedIntervention(null);
      fetchInterventions();
    } catch (err: any) {
      alert(err.message || 'Failed to update intervention');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Academic Intervention Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Formal tracking of student counselling, remedial cohorts, mentor reviews, and recorded outcomes
          </p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="FOLLOW_UP_REQUIRED">Follow-Up Required</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading intervention records..." />
      ) : error ? (
        <div className="p-4 bg-rose-50 text-rose-800 rounded">{error}</div>
      ) : interventions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
          No interventions registered matching the selected status filter.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="table-academic">
              <thead>
                <tr>
                  <th>Student Details</th>
                  <th>Priority & Scope</th>
                  <th>Intervention Strategy</th>
                  <th>Advisory Notes & Action Plan</th>
                  <th>Follow-Up Date</th>
                  <th>Outcome</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {interventions
                  .filter((inv) => !priorityFilter || inv.priority === priorityFilter)
                  .map((inv) => {
                    const isUrgent = inv.priority === 'URGENT';
                    const isHigh = inv.priority === 'HIGH';

                    return (
                      <tr key={inv.id}>
                        <td>
                          <p className="font-semibold text-navy text-xs">{inv.student.user.name}</p>
                          <p className="font-mono text-[11px] text-blue-700">{inv.student.registerNumber}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Staff: {inv.staff.user.name}</p>
                        </td>
                        <td>
                          <div className="space-y-1">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${
                                isUrgent
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : isHigh
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {inv.priority || 'MEDIUM'}
                            </span>
                            <span className="block text-[10px] text-slate-500 font-semibold uppercase">
                              {inv.category || 'ACADEMIC'}
                            </span>
                            {inv.subject && (
                              <span className="font-mono text-[10px] text-blue-600 block">
                                {inv.subject.code}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="font-semibold text-xs text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {inv.type}
                          </span>
                        </td>
                        <td className="text-xs text-slate-700 max-w-xs">
                          <p className="line-clamp-2 font-medium">{inv.notes}</p>
                          {inv.actionPlan && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              Plan: {inv.actionPlan}
                            </p>
                          )}
                        </td>
                        <td className="text-xs text-slate-600 whitespace-nowrap">
                          {inv.followUpDate ? (
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {new Date(inv.followUpDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          ) : (
                            'None scheduled'
                          )}
                        </td>
                        <td className="text-xs text-slate-600 max-w-xs">
                          {inv.outcome ? (
                            <p className="text-emerald-700 font-medium line-clamp-2">{inv.outcome}</p>
                          ) : (
                            <span className="text-slate-400 italic">Pending outcome</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              inv.status === 'RESOLVED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : inv.status === 'IN_PROGRESS'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : inv.status === 'FOLLOW_UP_REQUIRED'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleOpenEdit(inv)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Update
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Update Intervention Modal */}
      <Modal
        isOpen={!!selectedIntervention}
        onClose={() => setSelectedIntervention(null)}
        title={`Update Intervention — ${selectedIntervention?.student?.user?.name}`}
        maxWidth="lg"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <div className="flex items-center justify-between">
              <p className="font-bold text-navy">
                {selectedIntervention?.type} &bull; Reg: {selectedIntervention?.student?.registerNumber}
              </p>
              <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {selectedIntervention?.priority || 'MEDIUM'} Priority
              </span>
            </div>
            <p className="text-slate-600 mt-1">{selectedIntervention?.notes}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Intervention Status
              </label>
              <select
                value={updatedStatus}
                onChange={(e) => setUpdatedStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="OPEN">Open (Initiated)</option>
                <option value="IN_PROGRESS">In Progress (Active sessions)</option>
                <option value="FOLLOW_UP_REQUIRED">Follow-Up Required</option>
                <option value="RESOLVED">Resolved (Goals achieved)</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Priority Level
              </label>
              <select
                value={updatedPriority}
                onChange={(e) => setUpdatedPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Action Plan / Milestones
            </label>
            <input
              type="text"
              value={updatedActionPlan}
              onChange={(e) => setUpdatedActionPlan(e.target.value)}
              placeholder="e.g. Complete remedial problem sheet 3, attend 3 tutorial hours..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Documented Outcome / Student Progress
            </label>
            <textarea
              rows={2}
              value={updatedOutcome}
              onChange={(e) => setUpdatedOutcome(e.target.value)}
              placeholder="Record attendance improvements, CAT score improvements, or academic goals achieved..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Progress Notes Timeline */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Progress Notes Timeline
            </label>

            {selectedIntervention?.progressNotes && (
              <div className="max-h-32 overflow-y-auto space-y-1.5 p-2 bg-slate-50 border border-slate-200 rounded mb-2">
                {(() => {
                  try {
                    const notes = JSON.parse(selectedIntervention.progressNotes);
                    return notes.map((n: any, idx: number) => (
                      <div key={idx} className="text-[11px] border-b border-slate-100 pb-1 last:border-0">
                        <div className="flex justify-between text-slate-400 text-[10px]">
                          <span>{n.author}</span>
                          <span>{new Date(n.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-700 mt-0.5">{n.note}</p>
                      </div>
                    ));
                  } catch (e) {
                    return <p className="text-slate-400">No notes.</p>;
                  }
                })()}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Append quick progress note..."
                value={newProgressNote}
                onChange={(e) => setNewProgressNote(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={handleAddTimelineNote}
                disabled={isAddingNote || !newProgressNote.trim()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-semibold text-slate-700 disabled:opacity-50"
              >
                {isAddingNote ? 'Adding...' : 'Add Note'}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedIntervention(null)}
              className="px-4 py-2 border border-slate-300 rounded-md text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {isUpdating ? 'Saving...' : 'Save Intervention Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

