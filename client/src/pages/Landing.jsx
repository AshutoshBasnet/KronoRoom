import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  GraduationCap,
  Users,
  CheckCircle2,
  ChevronRight,
  Building,
  Clock,
  ShieldCheck
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
    <div className="min-h-screen text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Hero Section */}
      <section className="pt-36 sm:pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center space-y-6">
        {/* University Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-slate-200 text-xs font-medium shadow-sm">
          <GraduationCap className="w-4 h-4 text-blue-400" />
          <span>London Metropolitan University • KronoRoom Portal</span>
        </div>

        {/* Confident, Professional Headline */}
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-heading leading-tight">
            Classroom & Computer Lab <br className="hidden sm:inline" />
            <span className="text-blue-500">Live Occupancy & Scheduling</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Real-time room availability across Skill Block, London Block, and Kumari Block.
            Eliminate booking conflicts with automated 15-minute check-in protection.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/dashboard"
            className="krono-btn krono-btn-primary px-7 py-3.5 text-sm font-semibold rounded-xl flex items-center gap-2"
          >
            <span>Explore Live Rooms</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/login/student"
            className="krono-btn krono-btn-ghost px-7 py-3.5 text-sm font-semibold rounded-xl text-slate-200 hover:text-white"
          >
            <span>Sign In to Portal</span>
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-6">
          <div className="krono-card p-4 rounded-xl text-center">
            <span className="text-2xl font-bold font-mono text-white">{totalRooms}</span>
            <p className="text-xs text-slate-400 mt-1">Total Rooms</p>
          </div>
          <div className="krono-card p-4 rounded-xl text-center border-emerald-500/30">
            <span className="text-2xl font-bold font-mono text-emerald-400">{availableCount}</span>
            <p className="text-xs text-emerald-400/90 mt-1">Available Now</p>
          </div>
          <div className="krono-card p-4 rounded-xl text-center border-blue-500/30">
            <span className="text-2xl font-bold font-mono text-blue-400">{occupiedCount}</span>
            <p className="text-xs text-blue-300/90 mt-1">In Session</p>
          </div>
        </div>
      </section>

      {/* Dedicated Portals Section */}
      <section className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white font-heading tracking-tight">
            Dedicated University Portals
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tailored policies and credentials for students and academic staff
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Student Portal Card */}
          <div className="krono-card-hover rounded-2xl p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  Student Policy
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white font-heading">Student Portal</h3>
                <p className="text-xs text-slate-300 mt-1">
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
                  <span>Reserve up to 1 days in advance</span>
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
                className="krono-btn krono-btn-primary w-full text-xs flex items-center justify-center gap-2 rounded-xl"
              >
                <span>Enter Student Portal</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Faculty Portal Card */}
          <div className="krono-card-hover rounded-2xl p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Users className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  Faculty & Staff
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white font-heading">Faculty & Staff Portal</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Schedule lectures, lab practicals, exams, and departmental workshops.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Extended 6-hour lecture slots per booking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Book up to 30 days in advance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Administrative overrides & resource allocation</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Link
                to="/login/faculty"
                className="krono-btn krono-btn-primary w-full text-xs flex items-center justify-center gap-2 rounded-xl"
              >
                <span>Enter Faculty Portal</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-slate-800/80 bg-[#0a0e17] py-6 px-4 text-center text-xs text-slate-500">
        <p>
          © 2026 KronoRoom — London Metropolitan University Classroom & Lab Management System.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
