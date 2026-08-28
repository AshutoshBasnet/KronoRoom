import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  Users,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import api from '../utils/api';
import { FlipFadeText } from '@/components/ui/flip-fade-text';
import { CreepyButton } from '@/components/ui/creepy-button';

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
    <div className="min-h-screen text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Hero Section */}
      <section className="pt-36 sm:pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center space-y-6">
        {/* University Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-semibold shadow-[0_0_15px_rgba(0,245,255,0.15)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>KronoRoom • London Metropolitan University</span>
        </div>

        {/* Dynamic FlipFade Headline */}
        <div className="max-w-4xl mx-auto space-y-2">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-heading leading-tight">
            Intelligent Classroom & Lab
          </h1>
          <div className="min-h-[70px] sm:min-h-[85px] flex items-center justify-center">
            <FlipFadeText
              words={[
                "Booking & Occupancy System",
                "Smart Room Allocation",
                "Automated 15-Min Release",
                "Real-Time Schedule Matrix"
              ]}
              interval={3000}
              textClassName="text-3xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-[#00f5ff] via-[#38bdf8] to-[#00b4d8] bg-clip-text text-transparent tracking-tight font-heading normal-case"
            />
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300/90 max-w-2xl mx-auto leading-relaxed">
          Real-time room availability across Skill Block, London Block, and Kumari Block.
          Eliminate booking conflicts with automated 15-minute auto-release protection.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/dashboard" className="focus:outline-none">
            <CreepyButton
              className="rounded-full shadow-lg shadow-cyan-500/20 border border-cyan-400/30"
              coverClassName="bg-gradient-to-r from-[#00b4d8] to-[#0077b6] hover:from-[#0096c7] hover:to-[#023e8a] text-white shadow-[0_0_20px_rgba(0,180,216,0.35)] px-8 py-3.5 text-sm font-bold flex items-center gap-2 rounded-full"
            >
              <span>Find Free Rooms Now</span>
              <ArrowRight className="w-4 h-4" />
            </CreepyButton>
          </Link>

          <Link
            to="/login/student"
            className="krono-btn krono-btn-ghost px-7 py-3.5 text-sm font-semibold rounded-full border border-cyan-500/20 hover:border-cyan-400/40 text-cyan-100 hover:text-white transition-all shadow-sm"
          >
            <span>Sign In to Portal</span>
          </Link>
        </div>

        {/* Metric Pills */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-6">
          <div className="krono-card p-4 rounded-2xl border border-cyan-500/20 bg-[#001d3d]/40 backdrop-blur-md text-center shadow-[0_0_15px_rgba(0,245,255,0.08)]">
            <span className="text-2xl font-bold font-mono text-white">{totalRooms}</span>
            <p className="text-xs text-slate-400 mt-1">Total Rooms</p>
          </div>
          <div className="krono-card p-4 rounded-2xl border border-emerald-500/30 bg-[#001d3d]/40 backdrop-blur-md text-center shadow-[0_0_15px_rgba(16,185,129,0.12)]">
            <span className="text-2xl font-bold font-mono text-emerald-400">{availableCount}</span>
            <p className="text-xs text-emerald-400/90 mt-1">Available Now</p>
          </div>
          <div className="krono-card p-4 rounded-2xl border border-cyan-500/30 bg-[#001d3d]/40 backdrop-blur-md text-center shadow-[0_0_15px_rgba(0,245,255,0.12)]">
            <span className="text-2xl font-bold font-mono text-cyan-400">{occupiedCount}</span>
            <p className="text-xs text-cyan-400/90 mt-1">In Session</p>
          </div>
        </div>
      </section>

      {/* Dedicated Portals Section */}
      <section className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white font-heading tracking-tight">
            Dedicated University Portals
          </h2>
          <p className="text-xs text-cyan-200/70 mt-1">
            Tailored policies and credentials for students and academic staff
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Student Portal Card */}
          <div className="krono-card-hover rounded-2xl p-6 border border-cyan-500/20 bg-[#001d3d]/40 backdrop-blur-md flex flex-col justify-between space-y-5 shadow-[0_4px_25px_rgba(0,8,20,0.5)]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Student Policy
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white font-heading">Student Portal</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Book study sessions, computer labs, and project spaces with instant conflict validation.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Max 2 hours per reservation session</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Reserve up to 3 days in advance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>London Met Student ID authentication</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Link
                to="/login/student"
                className="krono-btn krono-btn-cyan w-full text-xs flex items-center justify-center gap-2 rounded-xl hover:ring-2 hover:ring-cyan-400/20 transition-all"
              >
                <span>Enter Student Portal</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Faculty Portal Card */}
          <div className="krono-card-hover rounded-2xl p-6 border border-cyan-500/20 bg-[#001d3d]/40 backdrop-blur-md flex flex-col justify-between space-y-5 shadow-[0_4px_25px_rgba(0,8,20,0.5)]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Users className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/30">
                  Faculty & Staff
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white font-heading">Faculty & Staff Portal</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Schedule lectures, lab practicals, exams, and departmental workshops.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Extended 6-hour lecture slots per booking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Book up to 30 days in advance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Administrative overrides & resource allocation</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Link
                to="/login/faculty"
                className="krono-btn krono-btn-oceanic w-full text-xs flex items-center justify-center gap-2 rounded-xl hover:ring-2 hover:ring-cyan-400/20 transition-all"
              >
                <span>Enter Faculty Portal</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-cyan-500/10 bg-[#000814]/80 py-6 px-4 text-center text-xs text-slate-400">
        <p>
          © 2026 KronoRoom — Smart Classroom & Lab Booking System (London Met). Built with MERN + Tailwind CSS v4.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
