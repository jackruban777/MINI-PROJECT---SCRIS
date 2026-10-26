import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { GraduationCap, Mail, ShieldCheck, Award } from 'lucide-react';

export const TeacherProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-xl font-bold text-navy">Faculty Profile & Designation</h1>
        <p className="text-xs text-slate-500 mt-1">
          Authorized faculty credentials and academic department assignment
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm max-w-2xl">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5 mb-5">
          <div className="w-14 h-14 rounded-full bg-navy text-white flex items-center justify-center font-bold text-xl shadow-sm">
            {user?.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-base font-bold text-navy">{user?.name}</h3>
            <p className="text-xs text-blue-700 font-semibold">{user?.teacherProfile?.designation}</p>
            <p className="text-xs text-slate-500 mt-0.5">{user?.department}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-slate-500 uppercase tracking-wider font-semibold">Staff Identifier</p>
            <p className="text-sm font-mono font-bold text-blue-700 mt-0.5">
              {user?.teacherProfile?.staffId || 'FAC-001'}
            </p>
          </div>

          <div>
            <p className="text-slate-500 uppercase tracking-wider font-semibold">Department Jurisdiction</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">{user?.department}</p>
          </div>

          <div>
            <p className="text-slate-500 uppercase tracking-wider font-semibold">Institutional Email</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">{user?.email}</p>
          </div>

          <div>
            <p className="text-slate-500 uppercase tracking-wider font-semibold">System Authorization</p>
            <p className="text-sm font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Faculty Role
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
