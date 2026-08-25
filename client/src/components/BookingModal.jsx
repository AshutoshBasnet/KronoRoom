import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Swords,
  Shield,
  Scroll
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export const BookingModal = ({ isOpen, onClose, room, onBookingSuccess }) => {
  const { user } = useAuth();

  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [purpose, setPurpose] = useState('');
  const [bookingType, setBookingType] = useState(
    user?.role === 'student' ? 'Study Session' : 'Regular Class'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [conflictData, setConflictData] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setConflictData(null);
      setSuccessMsg(null);

      const now = new Date();
      const nextHour = (now.getHours() + 1) % 24;
      const endHour = (nextHour + 2) % 24;

      const formatH = (h) => (h < 10 ? `0${h}:00` : `${h}:00`);
      setStartTime(formatH(nextHour));
      setEndTime(formatH(endHour === 0 ? 23 : endHour));
      setDate(format(now, 'yyyy-MM-dd'));
    }
  }, [isOpen, user]);

  if (!isOpen || !room) return null;

  const maxAllowedDays = user?.role === 'student' ? 3 : user?.role === 'teacher' ? 30 : 365;
  const maxDateStr = format(addDays(new Date(), maxAllowedDays), 'yyyy-MM-dd');
  const minDateStr = format(new Date(), 'yyyy-MM-dd');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setConflictData(null);
    setSuccessMsg(null);

    if (!purpose.trim()) {
      setErrorMsg('Please specify the purpose / quest title for this reservation.');
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    if (startDateTime >= endDateTime) {
      setErrorMsg('End time must be after start time on the same date.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        roomId: room._id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        purpose: purpose.trim(),
        bookingType
      };

      const { data } = await api.post('/bookings', payload);

      if (data.success) {
        setSuccessMsg('⚔️ Chamber Reserved! Added to your Quest Log.');
        if (onBookingSuccess) {
          onBookingSuccess(data.booking);
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setErrorMsg(error.response.data.message);
        setConflictData(error.response.data.conflict);
      } else {
        setErrorMsg(
          error.response?.data?.message || 'Failed to submit booking. Check inputs.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="pixel-dialog max-w-lg w-full p-6 text-slate-100 shadow-2xl relative my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-arcade text-xs bg-emerald-500 text-black px-2 py-1 border border-black shadow-[2px_2px_0px_#000]">
              {room.roomNumber}
            </span>
            <div>
              <h3 className="font-pixel text-lg font-bold text-white">
                CLAIM CHAMBER {room.roomNumber}
              </h3>
              <p className="font-pixel text-xs text-slate-400">
                {room.building} • Max Party: {room.capacity}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="pixel-btn pixel-btn-dark p-1 text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Policy Hint */}
        <div className="mt-3 p-2 bg-slate-950 border border-slate-800 text-xs font-pixel text-yellow-300 flex items-center gap-1.5">
          <Scroll className="w-4 h-4 text-yellow-400 shrink-0" />
          <span>
            {user?.role === 'student' && '🛡️ Student Quest: Max 2h session • Up to 3 days in advance'}
            {user?.role === 'teacher' && '🔮 Faculty Archmage: Max 6h session • Up to 30 days in advance'}
            {user?.role === 'admin' && '👑 Dungeon Master: Unrestricted Chamber Allocation'}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Alerts */}
          {errorMsg && (
            <div className="p-3 bg-rose-950 border-2 border-rose-600 text-rose-200 text-xs font-pixel space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-rose-300">
                <AlertTriangle className="w-4 h-4" />
                <span>CHAMBER CONFLICT / ERROR</span>
              </div>
              <p>{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950 border-2 border-emerald-500 text-emerald-200 text-xs font-pixel flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block font-pixel text-xs font-bold text-slate-300 uppercase mb-1">
              📅 Quest Date
            </label>
            <input
              type="date"
              value={date}
              min={minDateStr}
              max={maxDateStr}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border-2 border-black px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 shadow-[2px_2px_0px_#000]"
              required
            />
          </div>

          {/* Time Picker */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-pixel text-xs font-bold text-slate-300 uppercase mb-1">
                ⏰ Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border-2 border-black px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 shadow-[2px_2px_0px_#000]"
                required
              />
            </div>
            <div>
              <label className="block font-pixel text-xs font-bold text-slate-300 uppercase mb-1">
                ⏰ End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-950 border-2 border-black px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 shadow-[2px_2px_0px_#000]"
                required
              />
            </div>
          </div>

          {/* Booking Type */}
          <div>
            <label className="block font-pixel text-xs font-bold text-slate-300 uppercase mb-1">
              📜 Activity Type
            </label>
            <select
              value={bookingType}
              onChange={(e) => setBookingType(e.target.value)}
              className="w-full bg-slate-950 border-2 border-black px-3 py-2 text-sm font-pixel text-white focus:outline-none focus:border-emerald-500 shadow-[2px_2px_0px_#000]"
            >
              <option value="Study Session">Study Session / Group Revision</option>
              <option value="Ad-hoc Booking">Ad-hoc Project Work</option>
              <option value="Regular Class">Regular Class / Lab Session</option>
              {user?.role === 'admin' && <option value="Maintenance">Maintenance Lockdown</option>}
            </select>
          </div>

          {/* Purpose */}
          <div>
            <label className="block font-pixel text-xs font-bold text-slate-300 uppercase mb-1">
              ⚔️ Quest Purpose / Module Title
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. CS6004 Cloud Computing Lab Session"
              className="w-full bg-slate-950 border-2 border-black px-3 py-2 text-sm font-pixel text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 shadow-[2px_2px_0px_#000]"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t-2 border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="pixel-btn pixel-btn-dark text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="pixel-btn pixel-btn-green text-xs"
            >
              {isSubmitting ? 'Validating Spell...' : '⚔️ Confirm Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
