import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const RegisterTeacherPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerTeacher } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    staffId: '',
    email: '',
    department: 'Computer Science and Engineering',
    designation: 'Assistant Professor',
    inviteCode: 'SCRIS-FACULTY-2026',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerTeacher(formData);
      navigate('/teacher/dashboard');
    } catch (err: any) {
      setError(err.message || 'Faculty registration failed. Please verify your invite key.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="w-12 h-12 rounded bg-navy flex items-center justify-center text-white shadow-sm">
            <BookOpen className="w-6 h-6" />
          </Link>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-navy">
          Faculty Onboarding
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Authorized faculty access requiring an institutional invitation key
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-800 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>
                Demonstration Faculty Key: <strong>SCRIS-FACULTY-2026</strong>
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Faculty Invitation Key
              </label>
              <input
                type="text"
                required
                name="inviteCode"
                value={formData.inviteCode}
                onChange={handleChange}
                placeholder="SCRIS-FACULTY-2026"
                className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Dr. S. Raman"
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Staff ID
                </label>
                <input
                  type="text"
                  required
                  name="staffId"
                  value={formData.staffId}
                  onChange={handleChange}
                  placeholder="e.g. FAC-CSE-012"
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md uppercase focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Institutional Email
              </label>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="faculty.name@scris.edu"
                className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science</option>
                  <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                  <option value="Electrical and Electronics Engineering">Electrical and Electronics Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Designation
                </label>
                <input
                  type="text"
                  required
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g. Associate Professor"
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-xs font-semibold text-white bg-navy hover:bg-navy-dark disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Verifying Authorization...' : 'Complete Faculty Onboarding'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have faculty access?{' '}
            <Link to="/login?portal=teacher" className="font-semibold text-blue-600 hover:underline">
              Sign in to Faculty Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
