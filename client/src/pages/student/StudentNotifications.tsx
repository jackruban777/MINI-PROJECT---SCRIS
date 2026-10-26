import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { LoadingState } from '../../components/common/LoadingState';
import { Bell, CheckCheck, Check, Calendar, AlertTriangle, ShieldAlert } from 'lucide-react';

export const StudentNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get<{ notifications: any[]; unreadCount: number }>('/student/notifications');
      setNotifications(res.notifications);
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/student/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/student/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingState message="Loading academic notifications..." />;
  if (error) return <div className="p-4 bg-rose-50 text-rose-800 rounded">{error}</div>;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-navy">Academic Notifications & Alerts</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official announcements regarding risk alerts, examinations, and advisor interventions
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-xs font-semibold rounded text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-slate-500" />
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-sm text-slate-500">
          No notifications in your academic mailbox.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-lg border transition-all ${
                n.isRead ? 'bg-white border-slate-200' : 'bg-blue-50/40 border-blue-200 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-full mt-0.5 ${
                      n.type === 'RISK_CHANGE'
                        ? 'bg-rose-100 text-rose-700'
                        : n.type === 'EXAM_SCHEDULE'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {n.type === 'RISK_CHANGE' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : n.type === 'EXAM_SCHEDULE' ? (
                      <Calendar className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy">{n.title}</h4>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-slate-400 mt-2">
                      {new Date(n.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-100/50 flex-shrink-0"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
