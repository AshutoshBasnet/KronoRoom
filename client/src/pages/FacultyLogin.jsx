import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Briefcase,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Building,
  Monitor,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const FacultyLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login(email, password, 'faculty');

    if (result.success) {
      if (result.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  const handleDemoFill = (demoEmail, demoId = '') => {
    setEmail(demoEmail);
    setPassword('Password123');
    if (demoId) setIdCardNumber(demoId);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-24 pb-12 selection:bg-blue-600 selection:text-white">
      <div className="max-w-5xl w-full rounded-3xl border border-slate-800/80 bg-slate-950/80 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Panel: Brand & Institutional Focus */}
        <div className="w-full md:w-5/12 bg-[#0f172a]/95 border-b md:border-b-0 md:border-r border-slate-800 p-8 sm:p-10 flex flex-col justify-between text-white relative">
          <div>
            {/* University Wordmark */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-xl tracking-tight text-white font-heading">KronoRoom</h1>
                <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">London Metropolitan University</p>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="space-y-2 mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                Academic Staff & Estates Portal.
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Extended session management, 6-hour lecture slots, and advanced campus resource overrides.
              </p>
            </div>

            {/* Live Campus Telemetry Chips */}
            <div className="space-y-3">
              <div className="flex items-center gap-3.5 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">5 Campus Facilities</p>
                  <p className="text-[11px] text-slate-400">Skill, London & Kumari Blocks fully mapped</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">360 Workstations</p>
                  <p className="text-[11px] text-slate-400">Live seat telemetry and occupancy tracking</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">100% Real-Time Sync</p>
                  <p className="text-[11px] text-slate-400">Automated scheduling collision prevention</p>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Badge */}
          <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-slate-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>London Met IT Policy Compliant • 256-bit SSL</span>
          </div>
        </div>

        {/* Right Panel: Authentication Card */}
        <div className="w-full md:w-7/12 p-8 sm:p-10 flex flex-col justify-center bg-slate-900/40">
          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Tab Switcher */}
            <div className="flex border-b border-slate-800 pb-1">
              <Link
                to="/login/student"
                className="flex-1 py-2.5 text-xs font-medium text-slate-400 hover:text-slate-200 text-center transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student Portal</span>
              </Link>
              <button
                type="button"
                className="flex-1 py-2.5 text-xs font-bold border-b-2 border-blue-500 text-blue-400 text-center transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>Faculty & Staff Portal</span>
              </button>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white font-heading">Faculty & Staff Authorization</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your London Met faculty or administrative credentials to proceed.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5" htmlFor="email">
                  University Staff Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@londonmet.ac.uk"
                    className="w-full h-11 px-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5" htmlFor="idCard">
                  London Met Staff ID Number (Optional)
                </label>
                <input
                  id="idCard"
                  type="text"
                  value={idCardNumber}
                  onChange={(e) => setIdCardNumber(e.target.value)}
                  placeholder="e.g. LM-FAC-101"
                  className="w-full h-11 px-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5" htmlFor="password">
                  Account Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 pl-3.5 pr-11 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-slate-950 border-slate-700 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Remember Device</span>
                </label>
                <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                  Register Account
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="krono-btn krono-btn-primary w-full h-11 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Authorize & Enter Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick-Fill Demo Credentials Section */}
            <div className="pt-4 border-t border-slate-800 space-y-2.5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Quick-Fill Staff & Admin Credentials (PW: Password123)
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleDemoFill('s.adhikari@londonmet.ac.uk', 'LM-FAC-101')}
                  className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-center font-medium transition-colors cursor-pointer truncate"
                  title="Subigyan Adhikari (Faculty)"
                >
                  Faculty (Subigyan A.)
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('admin@londonmet.ac.uk', 'LM-ADM-001')}
                  className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-center font-bold transition-colors cursor-pointer truncate"
                  title="Campus Administrator (Estates & IT)"
                >
                  Admin (Campus Admin)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyLogin;
