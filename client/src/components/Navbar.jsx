import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Clock,
  LayoutDashboard,
  Calendar,
  Shield,
  LogOut,
  Menu,
  X,
  Sparkles,
  Layers,
  GraduationCap,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import socket from '../utils/socket';

export const Navbar = () => {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onConnect = () => setIsSocketConnected(true);
    const onDisconnect = () => setIsSocketConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
            Admin
          </span>
        );
      case 'teacher':
        return (
          <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
            Faculty
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
            Student
          </span>
        );
    }
  };

  const isActivePath = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand / Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                  <Clock className="w-5 h-5 text-indigo-400 group-hover:text-emerald-400 transition-colors" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-brand font-bold text-lg tracking-tight text-white">
                    Krono<span className="text-indigo-400">Room</span>
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    London Met
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 -mt-0.5">Smart Classroom & Lab Booking</p>
              </div>
            </Link>

            {/* Real-time Socket Indicator */}
            <div
              className="hidden lg:flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-full bg-slate-900/80 border border-white/10 text-[11px] font-medium"
              title={isSocketConnected ? 'Live updates synchronized' : 'Connecting to live updates...'}
            >
              <span className="relative flex h-2 w-2">
                {isSocketConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isSocketConnected ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                ></span>
              </span>
              <span className={isSocketConnected ? 'text-emerald-400' : 'text-amber-400'}>
                {isSocketConnected ? 'Live Sync' : 'Syncing...'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              to="/dashboard"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isActivePath('/dashboard')
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Live Rooms
            </Link>

            {isAuthenticated && (
              <Link
                to="/my-bookings"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActivePath('/my-bookings')
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Calendar className="w-4 h-4" />
                My Bookings
              </Link>
            )}

            {hasRole('admin') && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActivePath('/admin')
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin Console
              </Link>
            )}
          </nav>

          {/* User Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-xs font-bold text-white max-w-[140px] truncate">
                      {user.name}
                    </span>
                    {getRoleBadge(user.role)}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {user.idCardNumber} • {user.department?.split(' ')[0]}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login/student"
                  className="krono-btn krono-btn-ghost text-xs"
                >
                  Student Portal
                </Link>
                <Link
                  to="/login/faculty"
                  className="krono-btn krono-btn-primary text-xs"
                >
                  Faculty & Staff
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-white/10"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-3">
          {isAuthenticated && (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">{user.name}</p>
                <p className="text-[10px] text-slate-400">{user.idCardNumber} • {user.department}</p>
              </div>
              {getRoleBadge(user.role)}
            </div>
          )}

          <div className="space-y-1">
            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/5"
            >
              Live Rooms Dashboard
            </Link>
            {isAuthenticated && (
              <Link
                to="/my-bookings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/5"
              >
                My Bookings
              </Link>
            )}
            {hasRole('admin') && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10"
              >
                Admin Management
              </Link>
            )}
          </div>

          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="krono-btn krono-btn-danger w-full text-xs"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <>
                <Link
                  to="/login/student"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="krono-btn krono-btn-ghost w-full text-xs text-center"
                >
                  Student Portal Login
                </Link>
                <Link
                  to="/login/faculty"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="krono-btn krono-btn-primary w-full text-xs text-center"
                >
                  Faculty & Staff Portal
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
