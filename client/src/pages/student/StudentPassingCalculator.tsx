import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { LoadingState } from '../../components/common/LoadingState';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export const StudentPassingCalculator: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPassingMarks = async () => {
      try {
        const res = await api.get('/student/passing-marks');
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load passing marks calculation');
      } finally {
        setLoading(false);
      }
    };
    fetchPassingMarks();
  }, []);

  if (loading) return <LoadingState message="Calculating course passing requirements..." />;
  if (error || !data) {
    return <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded">{error}</div>;
  }

  const { courses, overallStatus, rulesSummary } = data;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Minimum Passing Marks Calculator</h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional assessment breakdown and minimum semester examination marks required to pass enrolled subjects
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          Read-Only Institutional Calculator
        </div>
      </div>

      {/* Institutional Passing Rules Explanation Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex items-start gap-2.5">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 space-y-1">
            <p className="font-semibold text-navy">Institutional Assessment Weighting & Passing Criteria:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
              <div className="bg-white border border-slate-200 p-2 rounded">
                <span className="text-slate-500 block">Internal Weight:</span>
                <span className="font-bold text-navy text-sm">{rulesSummary.internalWeight}%</span> (Max 40 Marks)
              </div>
              <div className="bg-white border border-slate-200 p-2 rounded">
                <span className="text-slate-500 block">Exam Weight:</span>
                <span className="font-bold text-navy text-sm">{rulesSummary.examWeight}%</span> (Max 60 Marks)
              </div>
              <div className="bg-white border border-slate-200 p-2 rounded">
                <span className="text-slate-500 block">Overall Pass Mark:</span>
                <span className="font-bold text-navy text-sm">&ge; {rulesSummary.overallPassingThreshold}%</span> Composite
              </div>
              <div className="bg-white border border-slate-200 p-2 rounded">
                <span className="text-slate-500 block">Exam Mandatory Min:</span>
                <span className="font-bold text-navy text-sm">&ge; {rulesSummary.mandatoryExamMinimum}%</span> Cutoff
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Cards / Table */}
      {courses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-sm text-slate-500">
          No active enrolled courses found for the current semester.
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course: any) => {
            const isSafe = course.status === 'SAFE';
            const isBorderline = course.status === 'BORDERLINE';
            const isCritical = course.status === 'CRITICAL';

            return (
              <div
                key={course.subjectId}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm"
              >
                <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {course.code}
                    </span>
                    <h3 className="text-sm font-bold text-navy">{course.name}</h3>
                    <span className="text-xs text-slate-500">({course.credits} Credits)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Difficulty Margin:</span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded border flex items-center gap-1 ${
                        isSafe
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isBorderline
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {isSafe && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isBorderline && <AlertTriangle className="w-3.5 h-3.5" />}
                      {isCritical && <AlertOctagon className="w-3.5 h-3.5" />}
                      {course.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Left Column: Internal Assessments Contribution */}
                  <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
                    <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                      Continuous Internal Score
                    </span>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-black text-navy">{course.internalPercentage}%</p>
                      <span className="text-xs text-slate-500">
                        ({course.internalObtainedTotal} / {course.internalMaxTotal} marks)
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Calculated contribution:{' '}
                      <strong className="text-blue-700">{course.internalContribution}</strong> / {course.internalWeight} marks
                    </p>
                  </div>

                  {/* Middle Column: Required Exam Score */}
                  <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
                    <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                      Required Semester Exam Mark
                    </span>
                    <div className="flex items-baseline gap-2">
                      <p
                        className={`text-2xl font-black ${
                          course.requiredExamMarksOutof100 > 70
                            ? 'text-rose-600'
                            : course.requiredExamMarksOutof100 > 50
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        {course.requiredExamMarksOutof100}%
                      </p>
                      <span className="text-xs text-slate-500">minimum in final paper</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Weighted exam target: <strong>{course.requiredExamContribution}</strong> / {course.examWeight} marks
                    </p>
                  </div>

                  {/* Right Column: Guidance & Margin */}
                  <div className="space-y-2">
                    <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                      Recommendation & Headroom
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">{course.recommendation}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                      <span>Error margin headroom:</span>
                      <span className="font-bold text-navy">{course.margin}%</span>
                    </div>
                  </div>
                </div>

                {/* Internal components list */}
                {course.internalAssessments.length > 0 && (
                  <div className="px-5 pb-4 pt-1 border-t border-slate-50 flex flex-wrap gap-2 text-[11px]">
                    <span className="text-slate-400 font-medium">Recorded Components:</span>
                    {course.internalAssessments.map((a: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium"
                      >
                        {a.type}: {a.score}/{a.maxScore} ({a.percentage}%)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
