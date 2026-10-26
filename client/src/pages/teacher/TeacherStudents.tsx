import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { LoadingState } from '../../components/common/LoadingState';
import { RiskBadge } from '../../components/common/RiskBadge';
import { Modal } from '../../components/common/Modal';
import { Search, Filter, Eye, ShieldCheck, User, Award, BookOpen, Clock } from 'lucide-react';

export const TeacherStudents: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [semesterFilter, setSemesterFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  // Selected student for detail modal
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (semesterFilter) queryParams.append('semester', semesterFilter);
      if (riskFilter) queryParams.append('riskCategory', riskFilter);

      const res = await api.get<{ students: any[]; totalCount: number }>(
        `/teacher/students?${queryParams.toString()}`
      );
      setStudents(res.students);
    } catch (err: any) {
      setError(err.message || 'Failed to load student directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [semesterFilter, riskFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleOpenStudentDetail = async (id: string) => {
    setSelectedStudentId(id);
    setLoadingDetail(true);
    try {
      const res = await api.get<{ student: any; riskAssessment: any; internalAssessments: any[]; semesterResults: any[]; attendanceRecords: any[]; arrears: any[]; interventions: any[] }>(
        `/teacher/students/${id}`
      );
      setStudentDetail(res);
    } catch (err: any) {
      alert(err.message || 'Failed to load student details');
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Assigned Student Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Searchable cohort directory with verified academic standing, arrear counts, and risk status
          </p>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Department Scope Protected</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name or register number..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
              <option value="7">Semester 7</option>
              <option value="8">Semester 8</option>
            </select>
          </div>

          <div className="sm:col-span-3 flex gap-2">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="">All Risk Categories</option>
              <option value="SAFE">Safe (0–34)</option>
              <option value="WATCH">Watch (35–64)</option>
              <option value="CRITICAL">Critical (65–100)</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors shadow-sm"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Students Data Table */}
      {loading ? (
        <LoadingState message="Filtering authorized student records..." />
      ) : error ? (
        <div className="p-4 bg-rose-50 text-rose-800 rounded">{error}</div>
      ) : students.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
          No students matched the active search and filter criteria.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-navy uppercase tracking-wider">
              Student Records ({students.length})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="table-academic">
              <thead>
                <tr>
                  <th>Register Number</th>
                  <th>Student Name</th>
                  <th>Degree & Class</th>
                  <th>CGPA</th>
                  <th>Arrears</th>
                  <th>Risk Category</th>
                  <th>Interventions</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="font-mono text-xs font-bold text-blue-700">{s.registerNumber}</td>
                    <td>
                      <p className="font-semibold text-slate-900 text-xs">{s.name}</p>
                      <p className="text-[11px] text-slate-500">{s.email}</p>
                    </td>
                    <td className="text-xs text-slate-700">
                      Sem {s.currentSemester} (Sec {s.section})
                    </td>
                    <td className="font-bold text-navy text-xs">
                      {s.cgpa > 0 ? s.cgpa.toFixed(2) : 'N/A'}
                    </td>
                    <td>
                      <span
                        className={`text-xs font-bold ${
                          s.pendingArrearsCount > 0 ? 'text-amber-700' : 'text-slate-500'
                        }`}
                      >
                        {s.pendingArrearsCount}
                      </span>
                    </td>
                    <td>
                      <RiskBadge category={s.riskCategory} score={s.riskScore} size="sm" />
                    </td>
                    <td>
                      {s.activeInterventionsCount > 0 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          {s.activeInterventionsCount} Active
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">None</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenStudentDetail(s.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Academic Detail Modal */}
      <Modal
        isOpen={!!selectedStudentId}
        onClose={() => {
          setSelectedStudentId(null);
          setStudentDetail(null);
        }}
        title="Student Academic Record (Read-Only)"
        maxWidth="2xl"
      >
        {loadingDetail || !studentDetail ? (
          <LoadingState message="Loading academic history..." />
        ) : (
          <div className="space-y-5 text-xs">
            {/* Header info */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-navy">{studentDetail.student.name}</h4>
                <p className="text-slate-500">
                  Reg: <strong>{studentDetail.student.registerNumber}</strong> &bull; {studentDetail.student.degree} (Sem {studentDetail.student.currentSemester})
                </p>
              </div>
              <RiskBadge
                category={studentDetail.riskAssessment.category}
                score={studentDetail.riskAssessment.score}
                size="md"
              />
            </div>

            {/* Diagnostic explanation */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-slate-700">
              <span className="font-bold text-navy">Risk Diagnostic: </span>
              {studentDetail.riskAssessment.explanation}
            </div>

            {/* 3 Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <p className="text-[10px] font-bold text-slate-500 uppercase">CGPA</p>
                <p className="text-base font-extrabold text-navy mt-0.5">
                  {studentDetail.riskAssessment.cgpa.toFixed(2)}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Pending Arrears</p>
                <p className="text-base font-extrabold text-amber-700 mt-0.5">
                  {studentDetail.arrears.filter((a: any) => a.status === 'PENDING').length}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Credits Earned</p>
                <p className="text-base font-extrabold text-navy mt-0.5">
                  {studentDetail.riskAssessment.totalCreditsEarned}
                </p>
              </div>
            </div>

            {/* Internal Assessments Table */}
            <div>
              <p className="font-bold text-navy uppercase text-[11px] mb-1.5">Internal Marks</p>
              <div className="border border-slate-200 rounded overflow-hidden max-h-40 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] text-slate-500 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-2">Subject</th>
                      <th className="p-2">Component</th>
                      <th className="p-2">Score</th>
                      <th className="p-2">Max</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentDetail.internalAssessments.map((a: any) => (
                      <tr key={a.id}>
                        <td className="p-2 font-semibold text-slate-800">{a.subject.code}</td>
                        <td className="p-2">{a.assessmentType}</td>
                        <td className="p-2 font-bold text-navy">{a.score}</td>
                        <td className="p-2 text-slate-500">{a.maxScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Subject Attendance */}
            <div>
              <p className="font-bold text-navy uppercase text-[11px] mb-1.5">Attendance Status</p>
              <div className="grid grid-cols-2 gap-2">
                {studentDetail.attendanceRecords.map((att: any) => (
                  <div key={att.id} className="p-2 border border-slate-200 rounded flex justify-between items-center">
                    <span className="font-mono text-[11px] font-bold text-slate-700">{att.subject.code}</span>
                    <span
                      className={`font-bold ${
                        att.percentage < 75 ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {att.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
