import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Crown, Sparkles, Lock, Mail, ArrowRight, AlertCircle, Briefcase } from 'lucide-react';
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
      <div className="pixel-dialog max-w-md w-full p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-purple-600 border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center mx-auto text-white">
            <Crown className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-pixel font-bold text-white tracking-wide">
            FACULTY & STAFF PORTAL
          </h2>
          <p className="text-xs font-pixel text-slate-400">
            London Metropolitan University • Academic Staff & Estates
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-rose-950 border-2 border-rose-600 text-rose-200 text-xs font-pixel flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Master Selector */}
        <div className="p-3.5 bg-black border-2 border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-pixel text-purple-300">
            <span className="flex items-center gap-1 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> SELECT ARCHMAGE:
            </span>
            <span className="text-[10px] text-slate-400">Pass: Password123</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoFill('a.pendelton@londonmet.ac.uk')}
              className="pixel-btn pixel-btn-purple py-1.5 px-1 text-center truncate text-[11px]"
              title="Prof. Arthur Pendelton (Faculty)"
            >
              🔮 Arthur P.
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('f.gallagher@londonmet.ac.uk')}
              className="pixel-btn pixel-btn-purple py-1.5 px-1 text-center truncate text-[11px]"
              title="Dr. Fiona Gallagher (Faculty)"
            >
              🔮 Fiona G.
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin@londonmet.ac.uk')}
              className="pixel-btn pixel-btn-rose py-1.5 px-1 text-center truncate text-[11px] font-bold"
              title="Dr. Eleanor Vance (Admin)"
            >
              👑 Admin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-pixel font-bold text-slate-300 uppercase mb-1">
              📜 Staff Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="a.pendelton@londonmet.ac.uk"
              className="w-full bg-slate-950 border-2 border-black px-3 py-2 text-sm font-pixel text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 shadow-[2px_2px_0px_#000]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-pixel font-bold text-slate-300 uppercase mb-1">
              🔒 Secret Passcode
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950 border-2 border-black px-3 py-2 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 shadow-[2px_2px_0px_#000]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="pixel-btn pixel-btn-purple w-full py-3 text-sm shadow-[3px_3px_0px_#000]"
          >
            {isLoading ? 'Unlocking Realm...' : '🔮 Sign In As Faculty Mage'}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-3 border-t-2 border-slate-800 flex items-center justify-between text-xs font-pixel text-slate-400">
          <Link to="/login/student" className="text-emerald-400 hover:text-emerald-300">
            ← Student Portal
          </Link>
          <Link to="/register" className="text-slate-300 hover:text-white">
            Register Character
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FacultyLogin;
