import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { LoadingState } from '../../components/common/LoadingState';
import { User, ShieldCheck, Phone, Mail, Award, CheckCircle } from 'lucide-react';
import { PredefinedDataBanner } from '../../components/common/PredefinedDataBanner';

export const StudentProfile: React.FC = () => {
  const [student, setStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get<{ student: any }>('/student/profile');
      setStudent(res.student);
      setPhone(res.student.phone || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await api.put('/student/profile', { phone });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update phone number');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading your student profile..." />;
  if (error || !student) {
    return <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-xl font-bold text-navy">Student Academic Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Institutional identification, academic registration, and advisory information
        </p>
      </div>

      {/* Predefined Profile Switcher */}
      <PredefinedDataBanner onRefresh={fetchProfile} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Institutional Credentials (Strictly Read-Only) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-navy uppercase tracking-wider">
                Academic Registration (Read-Only)
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Institutionally Controlled
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-500 uppercase tracking-wider font-semibold">Student Name</p>
                <p className="text-sm font-bold text-navy mt-0.5">{student.user.name}</p>
              </div>

              <div>
                <p className="text-slate-500 uppercase tracking-wider font-semibold">Register Number</p>
                <p className="text-sm font-mono font-bold text-blue-700 mt-0.5">{student.registerNumber}</p>
              </div>

              <div>
                <p className="text-slate-500 uppercase tracking-wider font-semibold">Department</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{student.user.department}</p>
              </div>

              <div>
                <p className="text-slate-500 uppercase tracking-wider font-semibold">Degree Program</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{student.degree}</p>
              </div>

              <div>
                <p className="text-slate-500 uppercase tracking-wider font-semibold">Current Semester</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  Semester {student.currentSemester} (Section {student.section})
                </p>
              </div>

              <div>
                <p className="text-slate-500 uppercase tracking-wider font-semibold">Batch Year</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{student.batchYear}</p>
              </div>

              <div>
                <p className="text-slate-500 uppercase tracking-wider font-semibold">Institutional Email</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{student.user.email}</p>
              </div>

              <div>
                <p className="text-slate-500 uppercase tracking-wider font-semibold">Enrolled Since</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {new Date(student.user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information (Editable Phone Number) */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
              Editable Contact Details
            </h3>

            {savedSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Contact phone number updated successfully.</span>
              </div>
            )}

            <form onSubmit={handleSavePhone} className="space-y-4 max-w-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Contact Mobile Number
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98401 23456"
                    className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 border border-transparent rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Updating...' : 'Save Contact Details'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Faculty Advisor Details */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
              Assigned Faculty Advisor
            </h3>

            {student.advisor ? (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg">
                  {student.advisor.user.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-navy">{student.advisor.user.name}</h4>
                  <p className="text-xs text-slate-500">{student.advisor.designation}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{student.advisor.user.email}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    <span>Staff ID: {student.advisor.staffId}</span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No faculty advisor currently assigned.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
