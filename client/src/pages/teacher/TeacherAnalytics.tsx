import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { LoadingState } from '../../components/common/LoadingState';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { LineChart, BarChart3, PieChart as PieIcon, ShieldAlert } from 'lucide-react';

export const TeacherAnalytics: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/teacher/academic-analytics');
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load department analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingState message="Aggregating department academic analytics..." />;
  if (error || !data) {
    return <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded">{error}</div>;
  }

  const { totalStudents, cgpaDistribution, riskDistribution, arrearDistribution } = data;

  const RISK_COLORS = {
    SAFE: '#10B981', // Emerald
    WATCH: '#F59E0B', // Amber
    CRITICAL: '#EF4444', // Red
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-navy">Department Academic Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Statistical performance curves, risk categorization, and arrear distributions across {totalStudents} assigned students
          </p>
        </div>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CGPA Distribution Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-navy flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              CGPA Performance Distribution
            </h3>
            <span className="text-[11px] text-slate-500">10-Point Scale</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cgpaDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#64748B' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Students" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Category Distribution Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-navy flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-blue-600" />
              Risk Classification Distribution
            </h3>
            <span className="text-[11px] text-slate-500">Cohort Proportion</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {riskDistribution.map((entry: any) => (
                    <Cell
                      key={entry.category}
                      fill={RISK_COLORS[entry.category as keyof typeof RISK_COLORS] || '#64748B'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Arrear Distribution Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-navy flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              Arrear Burden Breakdown
            </h3>
            <span className="text-[11px] text-slate-500">Number of Pending Backlogs</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={arrearDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="arrears" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Students" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
