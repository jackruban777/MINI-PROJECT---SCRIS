import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { LoadingState } from '../../components/common/LoadingState';
import {
  Calculator,
  RefreshCw,
  Award,
  TrendingUp,
  Info,
  ShieldAlert,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface CourseSimulationItem {
  code: string;
  name: string;
  credits: number;
  grade: string;
}

export const StudentCgpaSimulator: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Baseline records
  const [baselineData, setBaselineData] = useState<any | null>(null);

  // Courses being simulated
  const [courses, setCourses] = useState<CourseSimulationItem[]>([]);

  // Simulation output
  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  const fetchBaseline = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/student/cgpa-simulator');
      setBaselineData(res);

      const initialCourses: CourseSimulationItem[] = res.enrolledCourses.map((c: any) => ({
        code: c.code,
        name: c.name,
        credits: c.credits,
        grade: c.defaultGrade || 'A',
      }));

      setCourses(initialCourses);
      // Run initial simulation
      if (initialCourses.length > 0) {
        runSimulation(initialCourses);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load simulator data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBaseline();
  }, []);

  const runSimulation = async (coursesToSimulate: CourseSimulationItem[]) => {
    if (coursesToSimulate.length === 0) {
      setSimulationResult(null);
      return;
    }
    try {
      setSimulating(true);
      const res: any = await api.post('/student/cgpa-simulator/simulate', {
        courses: coursesToSimulate,
      });
      setSimulationResult(res);
    } catch (err: any) {
      setError(err.message || 'Simulation calculation failed');
    } finally {
      setSimulating(false);
    }
  };

  const handleGradeChange = (index: number, newGrade: string) => {
    const updated = [...courses];
    updated[index].grade = newGrade;
    setCourses(updated);
    runSimulation(updated);
  };

  const handleCreditsChange = (index: number, newCredits: number) => {
    const updated = [...courses];
    updated[index].credits = Math.max(1, Math.min(10, newCredits));
    setCourses(updated);
    runSimulation(updated);
  };

  const handleAddCourse = () => {
    const newCourse: CourseSimulationItem = {
      code: `ELECTIVE-${courses.length + 1}`,
      name: `Elective / Upcoming Course ${courses.length + 1}`,
      credits: 3,
      grade: 'A',
    };
    const updated = [...courses, newCourse];
    setCourses(updated);
    runSimulation(updated);
  };

  const handleRemoveCourse = (index: number) => {
    const updated = courses.filter((_, i) => i !== index);
    setCourses(updated);
    runSimulation(updated);
  };

  const handleReset = () => {
    if (baselineData) {
      const resetCourses: CourseSimulationItem[] = baselineData.enrolledCourses.map((c: any) => ({
        code: c.code,
        name: c.name,
        credits: c.credits,
        grade: 'A',
      }));
      setCourses(resetCourses);
      runSimulation(resetCourses);
    }
  };

  if (loading) return <LoadingState message="Loading CGPA What-If Simulator..." />;
  if (error && !baselineData) {
    return <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded">{error}</div>;
  }

  const actualCGPA = baselineData?.actualCGPA || 0;
  const simulatedCGPA = simulationResult?.simulatedCGPA ?? actualCGPA;
  const delta = simulationResult ? simulationResult.cgpaDelta : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-navy">CGPA What-If Simulator</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              HYPOTHETICAL ONLY
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate hypothetical semester grades and explore their mathematical impact on your cumulative GPA.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-300 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Baseline
        </button>
      </div>

      {/* Critical Academic Isolation Notice */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Strict Academic Data Isolation:</span> All figures in this simulator are
          hypothetical projections for academic trajectory planning. This tool does not alter, submit, or mutate your
          official institutional transcripts or verified database marks.
        </div>
      </div>

      {/* Comparison Cards: Actual vs Simulated */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Actual Verified CGPA */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Official CGPA</span>
            <span className="p-1.5 bg-slate-100 text-slate-600 rounded">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-navy mt-2">{actualCGPA.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">
            Verified across {baselineData?.actualTotalCredits || 0} attempted credits ({baselineData?.actualEarnedCredits || 0} cleared)
          </p>
        </div>

        {/* Simulated Projected CGPA */}
        <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">Simulated CGPA</span>
            <span className="p-1.5 bg-blue-600 text-white rounded">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-black text-blue-900">{simulatedCGPA.toFixed(2)}</p>
            {delta !== 0 && (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  delta > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)}
              </span>
            )}
          </div>
          <p className="text-xs text-blue-700 mt-1">
            Projected total: {simulationResult?.simulatedTotalCredits || 0} credits
          </p>
        </div>

        {/* Simulated Semester SGPA */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Simulated Semester SGPA</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-navy mt-2">
            {simulationResult ? simulationResult.simulatedSemesterSGPA.toFixed(2) : '—'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Across {courses.reduce((sum, c) => sum + c.credits, 0)} simulated credits in current scenario
          </p>
        </div>
      </div>

      {/* Interactive Course Grades Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-navy">Simulated Courses & Target Grades</h3>
            <p className="text-xs text-slate-500">
              Adjust expected grades or credits to explore how academic performance affects your degree standing
            </p>
          </div>
          <button
            onClick={handleAddCourse}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Scenario Subject
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table-academic">
            <thead>
              <tr>
                <th>Subject Code</th>
                <th>Subject Title</th>
                <th className="w-28">Credits</th>
                <th className="w-40">Hypothetical Grade</th>
                <th className="w-24">Grade Point</th>
                <th className="w-24">Weighted Points</th>
                <th className="w-16">Action</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    No courses added to simulation scenario. Click &quot;Add Scenario Subject&quot; above.
                  </td>
                </tr>
              ) : (
                courses.map((c, index) => {
                  const bdItem = simulationResult?.breakdown?.[index];
                  const gradePoint = bdItem?.gradePoint ?? (c.grade === 'O' ? 10 : c.grade === 'A+' ? 9 : c.grade === 'A' ? 8 : 7);
                  const weightedPoints = (c.credits * gradePoint).toFixed(1);

                  return (
                    <tr key={index}>
                      <td className="font-mono font-bold text-blue-700 text-xs">
                        <input
                          type="text"
                          value={c.code}
                          onChange={(e) => {
                            const updated = [...courses];
                            updated[index].code = e.target.value;
                            setCourses(updated);
                          }}
                          className="bg-transparent font-mono font-bold text-xs w-24 border-b border-dashed border-slate-300 focus:outline-none focus:border-blue-600"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={c.name}
                          onChange={(e) => {
                            const updated = [...courses];
                            updated[index].name = e.target.value;
                            setCourses(updated);
                          }}
                          className="bg-transparent text-xs text-slate-800 font-medium w-full border-b border-dashed border-slate-300 focus:outline-none focus:border-blue-600"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={c.credits}
                          onChange={(e) => handleCreditsChange(index, parseInt(e.target.value, 10) || 1)}
                          className="w-16 px-2 py-1 text-xs border border-slate-200 rounded text-center font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td>
                        <select
                          value={c.grade}
                          onChange={(e) => handleGradeChange(index, e.target.value)}
                          className="w-full px-2 py-1 text-xs font-semibold border border-slate-300 rounded bg-white text-navy focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {baselineData?.gradingScale.map((g: any) => (
                            <option key={g.grade} value={g.grade}>
                              {g.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="font-bold text-slate-700 text-center">{gradePoint}</td>
                      <td className="font-mono font-bold text-blue-800 text-center">{weightedPoints}</td>
                      <td className="text-center">
                        <button
                          onClick={() => handleRemoveCourse(index)}
                          title="Remove from simulation"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-4">
            <span>
              Total Simulated Credits: <strong>{courses.reduce((sum, c) => sum + c.credits, 0)}</strong>
            </span>
            <span>
              Scenario SGPA: <strong>{simulationResult?.simulatedSemesterSGPA.toFixed(2) || '0.00'}</strong>
            </span>
          </div>

          <span className="text-[11px] text-slate-500 italic">
            Institutional Standard 10-Point Scale Applied (O=10, A+=9, A=8, B+=7, B=6, C=5, RA=0)
          </span>
        </div>
      </div>
    </div>
  );
};
