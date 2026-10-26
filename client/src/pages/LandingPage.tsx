import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Users,
  FileCheck,
  Bell,
  Layers,
  ArrowRight,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold text-navy tracking-tight">SCRIS</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500 border-l border-slate-200 pl-2">
                Academic Risk & Intervention System
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-4 py-2 border border-blue-600 text-xs font-semibold rounded text-blue-600 bg-white hover:bg-blue-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-6">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                Institutional Academic Decision Support
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold text-navy tracking-tight leading-tight">
                Understand Academic Risk. <br className="hidden sm:inline" />
                <span className="text-blue-600">Take Action Earlier.</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                SCRIS helps students understand their academic progress and helps teachers identify learning difficulties early through transparent academic analytics and targeted interventions.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/login?portal=student"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <GraduationCap className="w-4 h-4" />
                  Student Portal
                </Link>
                <Link
                  to="/login?portal=teacher"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 text-sm font-semibold rounded-md text-navy bg-white hover:bg-slate-50 transition-colors"
                >
                  <Users className="w-4 h-4 text-blue-600" />
                  Faculty Portal
                </Link>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Transparent 5-Factor Risk Engine
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Read-Only Verified Academic Data
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Auditable Intervention Records
                </span>
              </div>
            </div>

            {/* Academic Visual Panel */}
            <div className="lg:col-span-5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Academic Risk Analysis Preview
                  </span>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-50 text-amber-800 border border-amber-200">
                    Watch Category (52/100)
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Internal Assessment Score (35%)</span>
                      <span className="font-bold text-navy">58%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: '58%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Arrear Burden (30%)</span>
                      <span className="font-bold text-navy">1 Pending Arrear</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '40%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span>Attendance Record (15%)</span>
                      <span className="font-bold text-navy">78.4%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '78%' }} />
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded text-xs text-slate-600 mt-4">
                    <p className="font-semibold text-navy">Recommended Academic Action:</p>
                    <p className="mt-1">
                      Target 36+ in CAT-2 for Database Management Systems to raise internal passing average.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy">Designed for Institutional Academic Success</h2>
          <p className="mt-3 text-sm text-slate-600">
            A comprehensive suite of academic monitoring, risk detection, and intervention workflows tailored for higher education.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Academic Tracking',
              desc: 'Continuous monitoring of internal marks, CAT assessments, and semester examination results.',
              icon: TrendingUp,
            },
            {
              title: 'Subject-Level Analysis',
              desc: 'Identify specific subjects with low test averages or high failure rates before finals.',
              icon: Layers,
            },
            {
              title: 'Risk Assessment',
              desc: 'Transparent 0–100 risk scoring with breakdown into Safe, Watch, and Critical categories.',
              icon: ShieldCheck,
            },
            {
              title: 'Arrear Monitoring',
              desc: 'Track pending arrears, clearance attempts, and semester graduation deadlines.',
              icon: AlertTriangle,
            },
            {
              title: 'Faculty Dashboard',
              desc: 'Class-level and department analytics, student directory, and at-risk rosters.',
              icon: Users,
            },
            {
              title: 'Intervention Tracking',
              desc: 'Formal academic counselling, remedial sessions, mentor meetings, and outcome tracking.',
              icon: CheckCircle2,
            },
            {
              title: 'Academic Reports',
              desc: 'One-click PDF progress reports for students and authorized CSV exports for faculty.',
              icon: FileCheck,
            },
            {
              title: 'Timely Notifications',
              desc: 'Configurable in-app alerts and email notifications for exams, risk changes, and follow-ups.',
              icon: Bell,
            },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <div className="w-10 h-10 rounded bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-navy">{f.title}</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy">How SCRIS Operates</h2>
            <p className="mt-2 text-sm text-slate-600">Three transparent steps to prevent course failure and delayed graduation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 relative">
              <span className="text-3xl font-bold text-blue-600">01</span>
              <h3 className="text-base font-semibold text-navy mt-2">Review Academic Data</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Academic data—assessments, attendance, semester grades, and credits—is loaded from the verified database layer without manual tampering.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 relative">
              <span className="text-3xl font-bold text-blue-600">02</span>
              <h3 className="text-base font-semibold text-navy mt-2">Identify Academic Risk</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                The risk engine calculates an explainable composite score (0–100) weighting internal marks (35%), arrears (30%), CGPA (15%), and attendance (15%).
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 relative">
              <span className="text-3xl font-bold text-blue-600">03</span>
              <h3 className="text-base font-semibold text-navy mt-2">Take Targeted Action</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Students receive concrete subject targets. Teachers schedule counselling, remedial classes, or mentor meetings with documented outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="mt-auto bg-navy text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 text-white font-bold text-lg mb-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                SCRIS
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Student Course Completion Risk and Intervention System. A specialized academic monitoring and decision support framework designed to protect graduation timelines.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Portals</p>
              <ul className="space-y-2 text-xs">
                <li><Link to="/login?portal=student" className="hover:text-white transition-colors">Student Portal</Link></li>
                <li><Link to="/login?portal=teacher" className="hover:text-white transition-colors">Faculty Portal</Link></li>
                <li><Link to="/register-student" className="hover:text-white transition-colors">Student Registration</Link></li>
                <li><Link to="/register-teacher" className="hover:text-white transition-colors">Faculty Access</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Security & Compliance</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Role-based scope control. Read-only verified academic data. Secure HTTP-only sessions.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} SCRIS — Academic Risk and Intervention System. Institutional Demonstration Platform.
          </div>
        </div>
      </footer>
    </div>
  );
};
