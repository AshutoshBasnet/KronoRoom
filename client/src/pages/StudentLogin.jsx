import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Lock, Mail, ArrowRight, AlertCircle, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const StudentLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login(email, password, 'student');

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  const handleDemoFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 pt-24 pb-12 selection:bg-cyan-500 selection:text-white">
      <div className="krono-card max-w-md w-full p-8 rounded-3xl border border-cyan-500/25 bg-[#001d3d]/55 backdrop-blur-xl shadow-[0_15px_50px_rgba(0,8,20,0.8)] space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.15)]">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white font-heading">
            KronoRoom Student Portal
          </h2>
          <p className="text-xs text-cyan-200/70">
            London Metropolitan University • Student Room Reservation
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Student Fillers */}
        <div className="p-3.5 rounded-2xl bg-[#001833]/80 border border-cyan-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold text-cyan-300 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" /> Quick Demo Student Logins:
            </span>
            <span className="text-[11px] text-slate-400">Password123</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoFill('a.basnet@londonmet.ac.uk')}
              className="px-2.5 py-1.5 rounded-lg bg-[#002447] hover:bg-[#003566] text-cyan-200 border border-cyan-500/20 truncate transition-colors text-center font-medium shadow-sm"
              title="Ashutosh Basnet (Computing & Digital Media)"
            >
              Ashutosh B.
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('a.poudel@londonmet.ac.uk')}
              className="px-2.5 py-1.5 rounded-lg bg-[#002447] hover:bg-[#003566] text-cyan-200 border border-cyan-500/20 truncate transition-colors text-center font-medium shadow-sm"
              title="Anmol Poudel (Architecture & Engineering)"
            >
              Anmol P.
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('p.rai@londonmet.ac.uk')}
              className="px-2.5 py-1.5 rounded-lg bg-[#002447] hover:bg-[#003566] text-cyan-200 border border-cyan-500/20 truncate transition-colors text-center font-medium shadow-sm"
              title="Parjun Rai (Business & Human Sciences)"
            >
              Parjun R.
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" /> Student Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. a.basnet@londonmet.ac.uk"
              className="w-full bg-[#001833] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all shadow-inner"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#001833] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono shadow-inner"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="krono-btn krono-btn-cyan w-full py-3 text-xs font-bold shadow-[0_0_20px_rgba(0,180,216,0.35)]"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign In as Student</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-cyan-500/15 flex items-center justify-between text-xs text-slate-400">
          <Link to="/login/faculty" className="text-cyan-300 hover:text-cyan-200 transition-colors">
            Faculty Portal →
          </Link>
          <Link to="/register" className="text-slate-300 hover:text-white transition-colors">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
