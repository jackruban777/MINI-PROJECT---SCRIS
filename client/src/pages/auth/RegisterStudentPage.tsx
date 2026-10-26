import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const RegisterStudentPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerStudent } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    registerNumber: '',
    email: '',
    department: 'Computer Science and Engineering',
    degree: 'B.Tech Computer Science and Engineering',
    currentSemester: 5,
    batchYear: 2023,
    section: 'A',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'currentSemester' || name === 'batchYear' ? parseInt(value, 10) : value,
    }));
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
      await registerStudent(formData);
      navigate('/student/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setIsSubmitting(false);
    }
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
          Student Registration
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Create your SCRIS student account to view personal risk analytics
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
                placeholder="e.g. Aakash Sundaram"
                className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Register Number
                </label>
                <input
                  type="text"
                  required
                  name="registerNumber"
                  value={formData.registerNumber}
                  onChange={handleChange}
                  placeholder="e.g. 21CSR105"
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md uppercase focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Current Semester
                </label>
                <select
                  name="currentSemester"
                  value={formData.currentSemester}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
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
                placeholder="student.name@student.scris.edu"
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
                  onChange={(e) => {
                    const dept = e.target.value;
                    const degreePrefix = dept.includes('Technology') || dept.includes('Artificial') ? 'B.Tech' : 'B.E.';
                    setFormData((prev) => ({
                      ...prev,
                      department: dept,
                      degree: `${degreePrefix} ${dept}`,
                    }));
                  }}
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="Computer Science and Engineering">Computer Science and Engineering (B.E. CSE)</option>
                  <option value="Information Technology">Information Technology (B.Tech IT)</option>
                  <option value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science (B.Tech AI & DS)</option>
                  <option value="Electronics and Communication Engineering">Electronics and Communication Engineering (B.E. ECE)</option>
                  <option value="Electrical and Electronics Engineering">Electrical and Electronics Engineering (B.E. EEE)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering (B.E. Mech)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Section
                </label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  placeholder="A"
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
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Registering Account...' : 'Complete Registration'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login?portal=student" className="font-semibold text-blue-600 hover:underline">
              Sign in to Student Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
