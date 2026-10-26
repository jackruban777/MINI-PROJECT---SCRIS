import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { LoadingState } from '../../components/common/LoadingState';
import { Calendar, Clock, MapPin, BookOpen, AlertCircle } from 'lucide-react';

export const StudentTimetable: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'weekly' | 'exams'>('weekly');

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await api.get('/student/timetable');
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load timetable');
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  if (loading) return <LoadingState message="Loading academic timetable and examination schedules..." />;
  if (error || !data) {
    return <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded">{error}</div>;
  }

  const { timetable } = data;
  const entries = timetable.entries || [];

  const weeklyLectures = entries.filter((e: any) => e.entryType === 'LECTURE' || e.entryType === 'LAB');
  const examinationEntries = entries.filter(
    (e: any) => e.entryType === 'INTERNAL_ASSESSMENT' || e.entryType === 'SEMESTER_EXAM'
  );

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Academic Timetable & Exam Schedule</h1>
          <p className="text-xs text-slate-500 mt-1">
            Department: {timetable.department} &bull; Semester {timetable.semester} &bull; Section {timetable.section}
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              viewMode === 'weekly' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-navy'
            }`}
          >
            Weekly Classes
          </button>
          <button
            onClick={() => setViewMode('exams')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              viewMode === 'exams' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-navy'
            }`}
          >
            Exam Schedule ({examinationEntries.length})
          </button>
        </div>
      </div>

      {viewMode === 'weekly' ? (
        <div className="space-y-4">
          {daysOfWeek.map((day) => {
            const dayEntries = weeklyLectures.filter((e: any) => e.dayOfWeek === day);
            return (
              <div key={day} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-navy uppercase tracking-wider">{day}</h3>
                  <span className="text-[11px] text-slate-500">{dayEntries.length} Sessions</span>
                </div>

                {dayEntries.length === 0 ? (
                  <p className="p-4 text-xs text-slate-400 italic">No scheduled lectures for this day.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {dayEntries.map((entry: any) => (
                      <div key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {entry.startTime} - {entry.endTime}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-navy">{entry.subject?.name || 'Lecture Session'}</p>
                            <p className="text-xs text-slate-500 font-mono">{entry.subject?.code}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {entry.room}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {entry.entryType}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-navy flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Scheduled Assessment & Examination Dates
            </h3>
          </div>

          {examinationEntries.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-500">No examination dates published yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-academic">
                <thead>
                  <tr>
                    <th>Exam Date</th>
                    <th>Timing</th>
                    <th>Course Code & Title</th>
                    <th>Hall / Room</th>
                    <th>Assessment Type</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {examinationEntries.map((exam: any) => (
                    <tr key={exam.id}>
                      <td className="font-bold text-navy text-xs">
                        {exam.examDate
                          ? new Date(exam.examDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'TBD'}
                      </td>
                      <td className="font-mono text-xs text-slate-700">
                        {exam.startTime} - {exam.endTime}
                      </td>
                      <td>
                        <span className="font-mono text-xs font-bold text-blue-700 mr-2">
                          {exam.subject?.code}
                        </span>
                        <span className="font-semibold text-slate-800">{exam.subject?.name}</span>
                      </td>
                      <td className="text-slate-700 text-xs font-medium">{exam.room}</td>
                      <td>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          {exam.entryType}
                        </span>
                      </td>
                      <td className="text-xs text-slate-500">{exam.description || 'Mandatory attendance'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
