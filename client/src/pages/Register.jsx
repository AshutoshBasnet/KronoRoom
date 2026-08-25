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
  Sparkles,
  Swords
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-black my-6">
      <div className="pixel-dialog max-w-lg w-full p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-600 border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center mx-auto text-black">
            <Swords className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-pixel font-bold text-white tracking-wide">
            CHARACTER CREATION
          </h2>
          <p className="text-xs font-pixel text-slate-400">
            Register your hero profile for London Met Academic Quest
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-rose-950 border-2 border-rose-600 text-rose-200 text-xs font-pixel flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Character Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Hero Name */}
            <div>
              <label className="block text-xs font-pixel font-bold text-slate-300 uppercase mb-1">
                🛡️ Character Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Alex Henderson"
                className="w-full bg-slate-950 border-2 border-black px-3 py-2 text-sm font-pixel text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 shadow-[2px_2px_0px_#000]"
                required
              />
            </div>

            {/* Hero Class */}
            <div>
              <label className="block text-xs font-pixel font-bold text-slate-300 uppercase mb-1">
                ⚔️ Character Class
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-slate-950 border-2 border-black px-3 py-2 text-sm font-pixel text-white focus:outline-none focus:border-emerald-500 shadow-[2px_2px_0px_#000]"
              >
                <option value="student">Student (2h limit / 3-day max)</option>
                <option value="teacher">Faculty (6h limit / 30-day max)</option>
                <option value="admin">Dungeon Master (Admin)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* University Email */}
            <div>
              <label className="block text-xs font-pixel font-bold text-slate-300 uppercase mb-1">
                📜 University Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="a.henderson@londonmet.ac.uk"
                className="w-full bg-slate-950 border-2 border-black px-3 py-2 text-sm font-pixel text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 shadow-[2px_2px_0px_#000]"
                required
              />
            </div>

            {/* London Met ID */}
            <div>
              <label className="block text-xs font-pixel font-bold text-slate-300 uppercase mb-1">
                💳 London Met ID
              </label>
              <input
                type="text"
                name="idCardNumber"
                value={formData.idCardNumber}
                onChange={handleChange}
                placeholder="LM-2024-998"
                className="w-full bg-slate-950 border-2 border-black px-3 py-2 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 shadow-[2px_2px_0px_#000]"
                required
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-pixel font-bold text-slate-300 uppercase mb-1">
              🏰 Academic Guild / Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full bg-slate-950 border-2 border-black px-3 py-2 text-sm font-pixel text-white focus:outline-none focus:border-emerald-500 shadow-[2px_2px_0px_#000]"
            >
              {departments.map((dept, i) => (
                <option key={i} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Passcode */}
          <div>
            <label className="block text-xs font-pixel font-bold text-slate-300 uppercase mb-1">
              🔒 Secret Passcode (Min 6 Chars)
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              className="w-full bg-slate-950 border-2 border-black px-3 py-2 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 shadow-[2px_2px_0px_#000]"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="pixel-btn pixel-btn-green w-full py-3 text-sm shadow-[3px_3px_0px_#000]"
          >
            {isLoading ? 'Forging Character...' : '⚔️ Spawn Character'}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-3 border-t-2 border-slate-800 text-center text-xs font-pixel text-slate-400">
          Already spawned?{' '}
          <Link to="/login/student" className="text-emerald-400 font-bold hover:underline">
            Enter Dungeon Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
