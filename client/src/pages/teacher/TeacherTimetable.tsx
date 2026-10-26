import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { LoadingState } from '../../components/common/LoadingState';
import { Calendar, Clock, MapPin, BookOpen } from 'lucide-react';

export const TeacherTimetable: React.FC = () => {
  const [timetables, setTimetables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await api.get<{ timetables: any[] }>('/teacher/timetable');
        setTimetables(res.timetables);
      } catch (err: any) {
        setError(err.message || 'Failed to load department timetable');
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  if (loading) return <LoadingState message="Loading department schedules..." />;
  if (error) return <div className="p-4 bg-rose-50 text-rose-800 rounded">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-xl font-bold text-navy">Department Timetables & Schedules</h1>
        <p className="text-xs text-slate-500 mt-1">
          Master class schedules and examination monitoring across assigned department sections
        </p>
      </div>

      {timetables.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
          No timetables registered for your department.
        </div>
      ) : (
        <div className="space-y-6">
          {timetables.map((tt) => (
            <div key={tt.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-navy">
                    {tt.department} &bull; Semester {tt.semester} (Section {tt.section})
                  </h3>
                  <p className="text-[11px] text-slate-500">Academic Year: {tt.academicYear}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  {tt.entries.length} Scheduled Entries
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="table-academic">
                  <thead>
                    <tr>
                      <th>Day / Exam Date</th>
                      <th>Timing</th>
                      <th>Subject Code & Title</th>
                      <th>Room</th>
                      <th>Type</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tt.entries.map((entry: any) => (
                      <tr key={entry.id}>
                        <td className="font-semibold text-navy text-xs">
                          {entry.examDate
                            ? new Date(entry.examDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })
                            : entry.dayOfWeek || 'Weekly'}
                        </td>
                        <td className="font-mono text-xs text-slate-700">
                          {entry.startTime} - {entry.endTime}
                        </td>
                        <td>
                          <span className="font-mono text-xs font-bold text-blue-700 mr-2">
                            {entry.subject?.code}
                          </span>
                          <span className="font-semibold text-slate-800">{entry.subject?.name}</span>
                        </td>
                        <td className="text-xs text-slate-700">{entry.room}</td>
                        <td>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                            {entry.entryType}
                          </span>
                        </td>
                        <td className="text-xs text-slate-500">{entry.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
