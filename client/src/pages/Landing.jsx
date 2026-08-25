import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Swords,
  Shield,
  Scroll,
  Crown,
  Sparkles,
  ArrowRight,
  Zap,
  Clock,
  Compass,
  Users,
  CheckCircle2,
  Gamepad2
} from 'lucide-react';
import api from '../utils/api';
import LiveOccupancyBadge from '../components/LiveOccupancyBadge';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center space-y-6">
        {/* Retro 8-bit Banner */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-black border-2 border-slate-700 shadow-[3px_3px_0px_#000] text-yellow-400 text-xs font-arcade">
          <Gamepad2 className="w-4 h-4 text-emerald-400" />
          <span>LONDON METROPOLITAN UNIVERSITY • 2D RPG REALM</span>
        </div>

        {/* Pixel Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-pixel font-bold text-white tracking-wide leading-tight">
          SMART CLASSROOM & LAB <br />
          <span className="text-emerald-400 drop-shadow-[3px_3px_0px_#000]">
            CHAMBER BOOKING QUEST
          </span>
        </h1>

        {/* Subtitle */}
        <p className="font-pixel text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Explore campus dungeon chambers across Tower Building, Learning Sanctum, and Science
          Guild. Reserve conflict-free study slots and check in to avoid the 15-minute auto-release curse!
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/dashboard"
            className="pixel-btn pixel-btn-green text-base px-8 py-3.5 shadow-[4px_4px_0px_#000] flex items-center gap-2"
          >
            <Swords className="w-5 h-5" />
            <span>ENTER DUNGEON (FIND FREE ROOMS)</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Live Realm Metric Gauges */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-4">
          <div className="pixel-box p-3 text-center">
            <span className="font-arcade text-xl text-white">{totalRooms}</span>
            <p className="font-pixel text-xs text-slate-400 mt-1">Total Chambers</p>
          </div>
          <div className="pixel-box-green p-3 text-center">
            <span className="font-arcade text-xl text-emerald-300">{availableCount}</span>
            <p className="font-pixel text-xs text-emerald-300 mt-1">Available Now</p>
          </div>
          <div className="pixel-box-red p-3 text-center">
            <span className="font-arcade text-xl text-rose-300">{occupiedCount}</span>
            <p className="font-pixel text-xs text-rose-300 mt-1">In Session</p>
          </div>
        </div>
      </section>

      {/* Hero Class Portals Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-pixel font-bold text-white">
            CHOOSE YOUR HERO CLASS
          </h2>
          <p className="text-xs font-pixel text-slate-400 mt-0.5">
            Select your character portal to access specialized academic perks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Student Knight Card */}
          <div className="pixel-box p-6 border-blue-500/60 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-arcade text-xs bg-blue-600 text-white px-2 py-1 border border-black shadow-[2px_2px_0px_#000]">
                  CLASS: STUDENT
                </span>
                <span className="font-pixel text-xs text-blue-300">🛡️ Scholar Knight</span>
              </div>

              <h3 className="font-pixel text-xl font-bold text-white">Student Portal</h3>
              <p className="font-pixel text-xs text-slate-300 mt-1">
                Book study sessions, Mac labs, and group revision chambers with zero scheduling conflicts.
              </p>

              <ul className="space-y-2 text-xs font-pixel text-slate-300 mt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Max 2 hours per quest session</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Reserve up to 3 days in advance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>London Met Student ID badge login</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <Link
                to="/login/student"
                className="pixel-btn pixel-btn-green w-full text-center"
              >
                Enter Student Portal →
              </Link>
            </div>
          </div>

          {/* Faculty Mage Card */}
          <div className="pixel-box p-6 border-purple-500/60 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-arcade text-xs bg-purple-600 text-white px-2 py-1 border border-black shadow-[2px_2px_0px_#000]">
                  CLASS: FACULTY
                </span>
                <span className="font-pixel text-xs text-purple-300">🔮 Archmage Master</span>
              </div>

              <h3 className="font-pixel text-xl font-bold text-white">Faculty & Staff Portal</h3>
              <p className="font-pixel text-xs text-slate-300 mt-1">
                Schedule lecture halls, GPU research clusters, exams, and departmental workshops.
              </p>

              <ul className="space-y-2 text-xs font-pixel text-slate-300 mt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Extended 6-hour lecture slots</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Book up to 30 days in advance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Master chamber allocation rights</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <Link
                to="/login/faculty"
                className="pixel-btn pixel-btn-purple w-full text-center"
              >
                Enter Faculty Portal →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core RPG Mechanics */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="pixel-box p-5 space-y-2">
            <div className="w-8 h-8 bg-emerald-500 text-black flex items-center justify-center font-bold border border-black shadow-[2px_2px_0px_#000]">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-pixel text-base font-bold text-white">
              Concurrency Shield
            </h4>
            <p className="font-pixel text-xs text-slate-400 leading-relaxed">
              Mathematical overlap checking prevents double booking of chambers across all players.
            </p>
          </div>

          <div className="pixel-box p-5 space-y-2">
            <div className="w-8 h-8 bg-yellow-500 text-black flex items-center justify-center font-bold border border-black shadow-[2px_2px_0px_#000]">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-pixel text-base font-bold text-white">
              15m Auto-Release Spell
            </h4>
            <p className="font-pixel text-xs text-slate-400 leading-relaxed">
              Unattended chambers are automatically reclaimed after 15 minutes to maximize campus space.
            </p>
          </div>

          <div className="pixel-box p-5 space-y-2">
            <div className="w-8 h-8 bg-purple-500 text-white flex items-center justify-center font-bold border border-black shadow-[2px_2px_0px_#000]">
              <Scroll className="w-5 h-5" />
            </div>
            <h4 className="font-pixel text-base font-bold text-white">
              Live Quest Log & Check-In
            </h4>
            <p className="font-pixel text-xs text-slate-400 leading-relaxed">
              1-click check-in verifies your party arrival and broadcasts real-time occupancy updates.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t-2 border-black bg-slate-950 py-6 px-4 text-center text-xs font-pixel text-slate-500">
        <p>
          © 2026 London Metropolitan University — 2D Pixel RPG Campus Booking Quest. Built with MERN + Tailwind CSS v4.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
