import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  GraduationCap,
  Users,
  CheckCircle2,
  ChevronRight,
  Building,
  Monitor
} from 'lucide-react';
import api from '../utils/api';

export const Landing = () => {
  const [liveRooms, setLiveRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await api.get('/rooms/live-status');
        if (data.success) {
          setLiveRooms(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching rooms for landing:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const totalRooms = liveRooms.length || 6;
  const occupiedCount = liveRooms.filter((r) => r.isOccupied).length || 1;
  const availableCount = totalRooms - occupiedCount;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>KronoRoom • London Metropolitan University</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-heading leading-tight max-w-4xl mx-auto">
          Intelligent Classroom & Lab <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
            Booking & Occupancy Matrix
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Real-time room availability across Tower Building, Learning Centre, and Science Centre.
          Eliminate booking conflicts with automated 15-minute auto-release protection.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/dashboard"
            className="krono-btn krono-btn-primary px-8 py-3.5 text-sm font-bold shadow-lg shadow-indigo-600/30 group flex items-center gap-2"
          >
            <span>Find Free Rooms Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/login/student"
            className="krono-btn krono-btn-ghost px-6 py-3.5 text-sm font-semibold"
          >
            <span>Sign In to Portal</span>
          </Link>
        </div>

        {/* Metric Pills */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-6">
          <div className="krono-card p-4 rounded-2xl text-center">
            <span className="text-2xl font-bold font-mono text-white">{totalRooms}</span>
            <p className="text-xs text-slate-400 mt-1">Total Rooms</p>
          </div>
          <div className="krono-card p-4 rounded-2xl border-emerald-500/20 text-center">
            <span className="text-2xl font-bold font-mono text-emerald-400">{availableCount}</span>
            <p className="text-xs text-emerald-400/80 mt-1">Available Now</p>
          </div>
          <div className="krono-card p-4 rounded-2xl border-rose-500/20 text-center">
            <span className="text-2xl font-bold font-mono text-rose-400">{occupiedCount}</span>
            <p className="text-xs text-rose-400/80 mt-1">In Session</p>
          </div>
        </div>
      </section>

      {/* Dedicated Portals Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white font-heading">
            Dedicated University Portals
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tailored policies and credentials for students and academic staff
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Student Portal Card */}
          <div className="krono-card-hover rounded-2xl p-6 border border-blue-500/20 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30">
                  Student Policy
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white font-heading">Student Portal</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Book study sessions, computer labs, and project spaces with instant conflict validation.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Max 2 hours per reservation session</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Reserve up to 3 days in advance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>London Met Student ID authentication</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Link
                to="/login/student"
                className="krono-btn krono-btn-primary w-full text-xs flex items-center justify-center gap-2"
              >
                <span>Enter Student Portal</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Faculty Portal Card */}
          <div className="krono-card-hover rounded-2xl p-6 border border-purple-500/20 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Users className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  Faculty & Staff
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white font-heading">Faculty & Staff Portal</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Schedule lectures, lab practicals, exams, and departmental workshops.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Extended 6-hour lecture slots per booking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Book up to 30 days in advance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Administrative overrides & resource allocation</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Link
                to="/login/faculty"
                className="krono-btn krono-btn-purple w-full text-xs flex items-center justify-center gap-2"
              >
                <span>Enter Faculty Portal</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="krono-card p-6 rounded-2xl border border-white/10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-base text-white">
              Conflict-Free Concurrency
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mathematical overlap checking prevents double bookings simultaneously across all campus users.
            </p>
          </div>

          <div className="krono-card p-6 rounded-2xl border border-white/10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-base text-white">
              15m Auto-Release Protection
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated background jobs reclaim unattended rooms after 15 minutes to maximize campus space utilization.
            </p>
          </div>

          <div className="krono-card p-6 rounded-2xl border border-white/10 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-base text-white">
              Role-Based Access (RBAC)
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict policies protecting faculty lecture allocations, student study rights, and estates management.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 py-6 px-4 text-center text-xs text-slate-500">
        <p>
          © 2026 KronoRoom — Smart Classroom & Lab Booking System (London Met). Built with MERN + Tailwind CSS v4.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
