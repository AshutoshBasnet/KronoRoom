import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Lock,
  Mail,
  User,
  CreditCard,
  Building2,
  Briefcase,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    idCardNumber: '',
    role: 'student',
    department: 'Computing & Digital Media'
  });

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const departments = [
    'Computing & Digital Media',
    'Guildhall School of Business and Law',
    'Human Sciences',
    'Social Sciences & Humanities',
    'Architecture, Art & Design',
    'Campus Estates & IT Services'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await register(formData);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 pt-24 pb-12 selection:bg-cyan-500 selection:text-white">
      <div className="krono-card max-w-lg w-full p-8 rounded-3xl border border-cyan-500/25 bg-[#001d3d]/55 backdrop-blur-xl shadow-[0_15px_50px_rgba(0,8,20,0.8)] space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.15)]">
            <UserPlus className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white font-heading">
            Create KronoRoom Account
          </h2>
          <p className="text-xs text-cyan-200/70">
            Register your profile for London Met smart room booking
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name */}
            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-cyan-400" /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Alex Henderson"
                className="w-full bg-[#001833] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all shadow-inner"
                required
              />
            </div>

            {/* Role */}
            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-cyan-400" /> Role Type
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-[#001833] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all"
              >
                <option value="student">Student (2h session / 3-day advance max)</option>
                <option value="teacher">Faculty & Staff (6h session / 30-day advance max)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Email */}
            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-cyan-400" /> University Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="a.henderson@londonmet.ac.uk"
                className="w-full bg-[#001833] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all shadow-inner"
                required
              />
            </div>

            {/* ID Card */}
            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-cyan-400" /> London Met ID
              </label>
              <input
                type="text"
                name="idCardNumber"
                value={formData.idCardNumber}
                onChange={handleChange}
                placeholder="LM-2024-998"
                className="w-full bg-[#001833] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all shadow-inner"
                required
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" /> Department / School
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full bg-[#001833] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all"
            >
              {departments.map((dept, i) => (
                <option key={i} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-cyan-400" /> Password (Min 6 chars)
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              className="w-full bg-[#001833] border border-cyan-500/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono shadow-inner"
              required
              minLength={6}
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
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-cyan-500/15 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login/student" className="text-cyan-400 hover:text-cyan-300 font-semibold">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
