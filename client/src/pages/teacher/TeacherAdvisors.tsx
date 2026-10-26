import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { LoadingState } from '../../components/common/LoadingState';
import { RiskBadge } from '../../components/common/RiskBadge';
import { Modal } from '../../components/common/Modal';
import {
  UserCheck,
  Users,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Search,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';

export const TeacherAdvisors: React.FC = () => {
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [unassigned, setUnassigned] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Search filter
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [advRes, unassignRes]: [any, any] = await Promise.all([
        api.get('/teacher/advisors'),
        api.get('/teacher/advisors/unassigned'),
      ]);
      setAdvisors(advRes.advisors || []);
      setUnassigned(unassignRes.unassignedStudents || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load advisor data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAssignModal = (student: any) => {
    setSelectedStudent(student);
    if (advisors.length > 0) {
      setSelectedAdvisorId(advisors[0].id);
    }
    setAssignModalOpen(true);
    setActionSuccess(null);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedAdvisorId) return;

    try {
      setSubmitting(true);
      await api.post('/teacher/advisors/assign', {
        studentId: selectedStudent.id,
        teacherId: selectedAdvisorId,
      });

      setActionSuccess(`Successfully assigned advisor for ${selectedStudent.name}.`);
      setAssignModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign advisor');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading faculty advisor mapping..." />;
  if (error) {
    return <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded">{error}</div>;
  }

  const totalAssignedCount = advisors.reduce((sum, a) => sum + a.adviseeCount, 0);
  const criticalUnassignedCount = unassigned.filter((s) => s.riskCategory === 'CRITICAL').length;

  const filteredUnassigned = unassigned.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.registerNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Faculty Advisor Mapping & Oversight</h1>
          <p className="text-xs text-slate-500 mt-1">
            Student-to-advisor assignments, mentee caseloads, and at-risk student advisory coverage
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Department Advisors</span>
          <p className="text-2xl font-black text-navy mt-1">{advisors.length}</p>
          <span className="text-[11px] text-slate-500">Active faculty members</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Advisees</span>
          <p className="text-2xl font-black text-blue-700 mt-1">{totalAssignedCount}</p>
          <span className="text-[11px] text-slate-500">Students with mentors</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Unassigned Students</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{unassigned.length}</p>
          <span className="text-[11px] text-slate-500">Awaiting advisor mapping</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Critical Unassigned</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{criticalUnassignedCount}</p>
          <span className="text-[11px] text-rose-600 font-medium">Immediate assignment needed</span>
        </div>
      </div>

      {/* Advisors Caseload Roster */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-bold text-navy">Faculty Advisor Caseloads</h3>
          <p className="text-xs text-slate-500">Mentorship distribution and vulnerable advisee counts</p>
        </div>

        <div className="overflow-x-auto">
          <table className="table-academic">
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Advisor Name</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Assigned Advisees</th>
                <th>Critical Risk Advisees</th>
                <th>Watch Advisees</th>
              </tr>
            </thead>
            <tbody>
              {advisors.map((adv) => (
                <tr key={adv.id}>
                  <td className="font-mono font-bold text-xs text-blue-700">{adv.staffId}</td>
                  <td className="font-semibold text-navy">{adv.name}</td>
                  <td className="text-slate-600 text-xs">{adv.designation}</td>
                  <td className="text-slate-600 text-xs">{adv.department}</td>
                  <td>
                    <span className="font-bold text-navy text-xs px-2 py-0.5 rounded bg-slate-100">
                      {adv.adviseeCount} students
                    </span>
                  </td>
                  <td>
                    {adv.criticalAdvisees > 0 ? (
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                        {adv.criticalAdvisees} Critical
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">0</span>
                    )}
                  </td>
                  <td>
                    {adv.watchAdvisees > 0 ? (
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        {adv.watchAdvisees} Watch
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unassigned Students Queue */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-navy">
              Unassigned Students Queue ({unassigned.length})
            </h3>
            <p className="text-xs text-slate-500">Students requiring formal faculty mentor allocation</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or reg no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {filteredUnassigned.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            {unassigned.length === 0
              ? 'All enrolled students currently have assigned faculty advisors.'
              : 'No unassigned students match your search criteria.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-academic">
              <thead>
                <tr>
                  <th>Reg Number</th>
                  <th>Student Name</th>
                  <th>Semester / Sec</th>
                  <th>Risk Level</th>
                  <th>Risk Score</th>
                  <th>Pending Arrears</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnassigned.map((st) => (
                  <tr key={st.id}>
                    <td className="font-mono font-bold text-xs text-blue-700">{st.registerNumber}</td>
                    <td className="font-semibold text-slate-800">{st.name}</td>
                    <td className="text-xs text-slate-600">
                      Sem {st.semester} - Sec {st.section}
                    </td>
                    <td>
                      <RiskBadge category={st.riskCategory} />
                    </td>
                    <td className="font-bold text-slate-700">{st.riskScore} / 100</td>
                    <td>
                      {st.pendingArrears > 0 ? (
                        <span className="text-xs font-semibold text-rose-700">{st.pendingArrears} Arrear(s)</span>
                      ) : (
                        <span className="text-xs text-slate-400">None</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenAssignModal(st)}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
                      >
                        Assign Advisor
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Advisor Modal */}
      {assignModalOpen && selectedStudent && (
        <Modal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          title={`Assign Academic Advisor`}
        >
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
              <p>
                Student: <strong>{selectedStudent.name}</strong> ({selectedStudent.registerNumber})
              </p>
              <p>
                Academic Standing: Semester {selectedStudent.semester} &bull;{' '}
                <span className="font-semibold text-rose-700">{selectedStudent.riskCategory} Risk</span> (Score:{' '}
                {selectedStudent.riskScore}/100)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Designated Faculty Advisor:
              </label>
              <select
                value={selectedAdvisorId}
                onChange={(e) => setSelectedAdvisorId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded bg-white text-navy focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                {advisors.map((adv) => (
                  <option key={adv.id} value={adv.id}>
                    {adv.name} ({adv.designation}) — Current Advisees: {adv.adviseeCount}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
