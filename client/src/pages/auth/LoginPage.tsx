import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { GraduationCap, Users, Lock, Mail, AlertCircle, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [portalRole, setPortalRole] = useState<UserRole>(
    searchParams.get('portal') === 'teacher' ? 'TEACHER' : 'STUDENT'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to respective dashboard
  useEffect(() => {
    if (user?.role) {
      if (user.role === 'STUDENT') navigate('/student/dashboard');
      else if (user.role === 'TEACHER' || user.role === 'ADMIN') navigate('/teacher/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const loggedInUser = await login({ email, password, role: portalRole });
      const targetRole = loggedInUser?.role || user?.role || portalRole;
      if (targetRole === 'STUDENT') {
        navigate('/student/dashboard', { replace: true });
      } else {
        navigate('/teacher/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = (demoEmail: string, demoPass: string, role: UserRole) => {
    setPortalRole(role);
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-page flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="w-12 h-12 rounded bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <BookOpen className="w-6 h-6" />
          </Link>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-navy">
          SCRIS Academic Portal
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Sign in to access verified academic analytics and interventions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-lg sm:px-10">
          {/* Portal Switch Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => {
                setPortalRole('STUDENT');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                portalRole === 'STUDENT'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-navy'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student Portal
            </button>
            <button
              type="button"
              onClick={() => {
                setPortalRole('TEACHER');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                portalRole === 'TEACHER'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-navy'
              }`}
            >
              <Users className="w-4 h-4" />
              Faculty Portal
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Institutional Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    portalRole === 'STUDENT'
                      ? 'student.name@student.scris.edu'
                      : 'faculty.name@scris.edu'
                  }
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Authenticating...' : `Sign In to ${portalRole === 'STUDENT' ? 'Student Portal' : 'Faculty Portal'}`}
            </button>
          </form>

          {/* Demonstration Quick Fill Accounts */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Quick-Fill {portalRole === 'STUDENT' ? 'Student' : 'Faculty'} Demonstration Accounts
            </p>
            <div className="grid grid-cols-1 gap-2 text-xs">
              {portalRole === 'STUDENT' ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickDemo('admin@gmail.com', '11111111', 'STUDENT')
                    }
                    className="text-left px-2.5 py-1.5 rounded border border-blue-400 bg-blue-50 hover:bg-blue-100/70 transition-all flex items-center justify-between shadow-xs"
                  >
                    <div>
                      <span className="font-bold text-blue-900">Admin Student</span>
                      <span className="text-blue-700 font-medium ml-1.5">(admin@gmail.com / 11111111)</span>
                    </div>
                    <span className="text-[10px] text-blue-700 font-bold bg-white px-2 py-0.5 rounded border border-blue-300">Quick Login &rarr;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickDemo('jack@gmail.com', 'student123', 'STUDENT')
                    }
                    className="text-left px-2.5 py-1.5 rounded border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-navy">Jack</span>
                      <span className="text-slate-500 ml-1.5">(Predefined Watch Profile, Sem 5 CSE)</span>
                    </div>
                    <span className="text-[10px] text-blue-600 font-bold">Use &rarr;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickDemo('arjun.kumar@student.scris.edu', 'student123', 'STUDENT')
                    }
                    className="text-left px-2.5 py-1.5 rounded border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-navy">Arjun Kumar</span>
                      <span className="text-slate-500 ml-1.5">(Critical Risk, 3 Arrears, 68% Attendance)</span>
                    </div>
                    <span className="text-[10px] text-blue-600 font-bold">Use &rarr;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickDemo('priya.nair@student.scris.edu', 'student123', 'STUDENT')
                    }
                    className="text-left px-2.5 py-1.5 rounded border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-navy">Priya Nair</span>
                      <span className="text-slate-500 ml-1.5">(Watch Risk, 1 Arrear, Borderline Internals)</span>
                    </div>
                    <span className="text-[10px] text-blue-600 font-bold">Use &rarr;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickDemo('rohit.verma@student.scris.edu', 'student123', 'STUDENT')
                    }
                    className="text-left px-2.5 py-1.5 rounded border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-navy">Rohit Verma</span>
                      <span className="text-slate-500 ml-1.5">(High Achiever, CGPA 9.12, 0 Arrears)</span>
                    </div>
                    <span className="text-[10px] text-blue-600 font-bold">Use &rarr;</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('admint@gmail.com', '22222222', 'TEACHER')}
                    className="text-left px-2.5 py-1.5 rounded border border-indigo-400 bg-indigo-50 hover:bg-indigo-100/70 transition-all flex items-center justify-between shadow-xs"
                  >
                    <div>
                      <span className="font-bold text-indigo-900">Admin Faculty</span>
                      <span className="text-indigo-700 font-medium ml-1.5">(admint@gmail.com / 22222222)</span>
                    </div>
                    <span className="text-[10px] text-indigo-700 font-bold bg-white px-2 py-0.5 rounded border border-indigo-300">Quick Login &rarr;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('prof.sharma@scris.edu', 'faculty123', 'TEACHER')}
                    className="text-left px-2.5 py-1.5 rounded border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-navy">Prof. Rajesh Sharma</span>
                      <span className="text-slate-500 ml-1.5">(CSE HOD & Faculty Advisor)</span>
                    </div>
                    <span className="text-[10px] text-blue-600 font-bold">Use &rarr;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('dr.anita@scris.edu', 'faculty123', 'TEACHER')}
                    className="text-left px-2.5 py-1.5 rounded border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-navy">Dr. Anita Desai</span>
                      <span className="text-slate-500 ml-1.5">(IT Advisor & Faculty)</span>
                    </div>
                    <span className="text-[10px] text-blue-600 font-bold">Use &rarr;</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
            <p>
              New Student?{' '}
              <Link to="/register-student" className="font-semibold text-blue-600 hover:underline">
                Register student account
              </Link>
            </p>
            <p>
              Faculty Onboarding?{' '}
              <Link to="/register-teacher" className="font-semibold text-blue-600 hover:underline">
                Register with faculty key
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
