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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white my-8">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="krono-card max-w-lg w-full p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
            <UserPlus className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white font-heading">
            Create KronoRoom Account
          </h2>
          <p className="text-xs text-slate-400">
            Register your profile for London Met smart room booking
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
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
                <User className="w-3.5 h-3.5 text-indigo-400" /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Alex Henderson"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            {/* Role */}
            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Role Type
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="student">Student (2h limit / 3-day max)</option>
                <option value="teacher">Faculty (6h limit / 30-day max)</option>
                <option value="admin">Administrator (Estates)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Email */}
            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-indigo-400" /> University Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="a.henderson@londonmet.ac.uk"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            {/* ID Card */}
            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-indigo-400" /> London Met ID
              </label>
              <input
                type="text"
                name="idCardNumber"
                value={formData.idCardNumber}
                onChange={handleChange}
                placeholder="LM-2024-998"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Department / School
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
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
              <Lock className="w-3.5 h-3.5 text-indigo-400" /> Password (Min 6 chars)
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="krono-btn krono-btn-primary w-full py-3 text-xs font-bold"
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
        <div className="pt-4 border-t border-white/10 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login/student" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
