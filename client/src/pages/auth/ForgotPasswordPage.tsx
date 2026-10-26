import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { api } from '../../lib/api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const res = await api.post<{ message: string; simulatedCode?: string }>('/auth/forgot-password', { email });
      setMessage(res.message);
      if (res.simulatedCode) {
        setSimulatedCode(res.simulatedCode);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to process recovery request.');
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
          Password Recovery
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Enter your institutional email address to receive password reset instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {message ? (
            <div className="space-y-4">
              <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{message}</p>
                  {simulatedCode && (
                    <p className="mt-2 text-slate-700 bg-white p-2 rounded border border-emerald-200">
                      Development Verification Code: <strong>{simulatedCode}</strong>
                    </p>
                  )}
                </div>
              </div>

              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Institutional Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. arjun.kumar@student.scris.edu"
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Sending Request...' : 'Send Recovery Instructions'}
              </button>

              <div className="pt-2 text-center">
                <Link to="/login" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Return to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
