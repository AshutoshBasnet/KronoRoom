import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const FacultyLogin = () => {
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

    const result = await login(email, password, 'faculty');

    if (result.success) {
      if (result.user.role === 'admin' && from === '/dashboard') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-purple-500 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="krono-card max-w-md w-full p-8 rounded-3xl border border-purple-500/20 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
            <Briefcase className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white font-heading">
            KronoRoom Faculty Portal
          </h2>
          <p className="text-xs text-slate-400">
            London Metropolitan University • Academic Staff & Estates
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Faculty Fillers */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-purple-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Quick Demo Staff Logins:
            </span>
            <span className="text-[11px]">Password: Password123</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoFill('a.pendelton@londonmet.ac.uk')}
              className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 truncate transition-colors text-center font-medium"
              title="Prof. Arthur Pendelton (Faculty)"
            >
              Prof. Arthur
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('f.gallagher@londonmet.ac.uk')}
              className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 truncate transition-colors text-center font-medium"
              title="Dr. Fiona Gallagher (Faculty)"
            >
              Dr. Fiona
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin@londonmet.ac.uk')}
              className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 truncate transition-colors text-center font-bold"
              title="Dr. Eleanor Vance (Admin)"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-400" /> Staff Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. a.pendelton@londonmet.ac.uk"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors font-mono"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="krono-btn krono-btn-purple w-full py-3 text-xs font-bold"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign In to Faculty Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <Link to="/login/student" className="text-blue-400 hover:text-blue-300 transition-colors">
            ← Student Portal
          </Link>
          <Link to="/register" className="text-slate-300 hover:text-white transition-colors">
            Register Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FacultyLogin;
