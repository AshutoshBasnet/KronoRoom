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
  Info,
  Armchair,
  ChevronDown,
  ChevronUp,
  BookOpen
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import SeatMap from './SeatMap';
import { SUBJECTS } from '../utils/subjects';

export const BookingModal = ({
  isOpen,
  onClose,
  room,
  isOccupied = false,
  isFullRoomOccupied = false,
  occupiedSeats = [],
  reservedSeats = [],
  currentBooking = null,
  initialSeat = null,
  onBookingSuccess
}) => {
  const { user } = useAuth();

  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [purpose, setPurpose] = useState('');
  const [bookingType, setBookingType] = useState(
    user?.role === 'student' ? 'Study Session' : 'Regular Class'
  );
  const [bookingScope, setBookingScope] = useState(() =>
    Array.isArray(initialSeat) && initialSeat.length > 0 ? 'seats' : initialSeat ? 'seats' : 'seats'
  );
  const [selectedSeats, setSelectedSeats] = useState(() =>
    Array.isArray(initialSeat) ? initialSeat : initialSeat ? [initialSeat] : []
  );
  const [showSeatMap, setShowSeatMap] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [conflictData, setConflictData] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const totalOccupiedSeatsCount = (occupiedSeats?.length || 0) + (reservedSeats?.length || 0);
  const isRoomPartiallyOrFullyOccupied = isOccupied || isFullRoomOccupied || totalOccupiedSeatsCount > 0;

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setConflictData(null);
      setSuccessMsg(null);
      const normalizedSeats = Array.isArray(initialSeat)
        ? initialSeat
        : initialSeat
        ? [initialSeat]
        : [];
      setSelectedSeats(normalizedSeats);
      if (normalizedSeats.length > 0 || isRoomPartiallyOrFullyOccupied) {
        setBookingScope('seats');
        setShowSeatMap(true);
      } else {
        setBookingScope('seats');
        setShowSeatMap(true);
      }

      const now = new Date();
      const nextHour = (now.getHours() + 1) % 24;
      const endHour = (nextHour + 2) % 24;

      const formatH = (h) => (h < 10 ? `0${h}:00` : `${h}:00`);
      setStartTime(formatH(nextHour));
      setEndTime(formatH(endHour === 0 ? 23 : endHour));
      setDate(format(now, 'yyyy-MM-dd'));

      document.body.classList.add('modal-open');
      document.body.setAttribute('data-modal-open', 'true');
      window.dispatchEvent(
        new CustomEvent('krono:modal-state', { detail: { isOpen: true, type: 'booking' } })
      );
    } else {
      document.body.classList.remove('modal-open');
      document.body.removeAttribute('data-modal-open');
      window.dispatchEvent(
        new CustomEvent('krono:modal-state', { detail: { isOpen: false, type: 'booking' } })
      );
    }

    return () => {
      document.body.classList.remove('modal-open');
      document.body.removeAttribute('data-modal-open');
      window.dispatchEvent(
        new CustomEvent('krono:modal-state', { detail: { isOpen: false, type: 'booking' } })
      );
    };
  }, [isOpen, initialSeat, user, isRoomPartiallyOrFullyOccupied]);

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
      setErrorMsg('Please specify the booking purpose.');
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    if (startDateTime >= endDateTime) {
      setErrorMsg('End time must be strictly after start time.');
      return;
    }

    if (bookingScope === 'full_room' && isRoomPartiallyOrFullyOccupied) {
      setErrorMsg('Full Room Session is only available when all seats in the room are 100% free/green.');
      setBookingScope('seats');
      setShowSeatMap(true);
      return;
    }

    if (bookingScope === 'seats' && selectedSeats.length === 0) {
      setErrorMsg('Please click the seat selector below to pick at least 1 seat, or select "Full Room Session".');
      setShowSeatMap(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const isFullRoom = bookingScope === 'full_room';
      const payload = {
        roomId: room._id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        purpose: purpose.trim(),
        bookingType,
        seatNumber: !isFullRoom && selectedSeats.length > 0 ? selectedSeats.join(', ') : null,
        selectedSeats: !isFullRoom ? selectedSeats : []
      };

      const { data } = await api.post('/bookings', payload);

      if (data.success) {
        setSuccessMsg(
          !isFullRoom && selectedSeats.length > 0
            ? `Room ${room.roomNumber} (${selectedSeats.length === 1 ? 'Seat' : 'Seats'}: #${selectedSeats.join(', #')}) booked successfully!`
            : `Full Room ${room.roomNumber} (${room.capacity} seats) reserved successfully!`
        );
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="krono-modal max-w-2xl w-full rounded-2xl p-6 text-slate-100 relative my-6 max-h-[92vh] overflow-y-auto border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold font-mono text-sm shadow-sm">
              {room.roomNumber}
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">
                Reserve Room {room.roomNumber}
              </h3>
              <p className="text-xs text-slate-400">
                {room.building} • Capacity: {room.capacity} seats
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Policy Hint */}
        <div className="mt-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 text-xs text-slate-300 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            {user?.role === 'student' && 'Student Policy: Max 2h session • Book up to 3 days in advance'}
            {user?.role === 'teacher' && 'Faculty Policy: Max 6h session • Book up to 30 days in advance'}
            {user?.role === 'admin' && 'Administrator: Unrestricted Duration & Scheduling'}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Slot Conflict / Error</span>
              </div>
              <p>{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date of Reservation
            </label>
            <input
              type="date"
              value={date}
              min={minDateStr}
              max={maxDateStr}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono transition-colors"
              required
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono transition-colors"
                required
              />
            </div>
          </div>

          {/* Booking Type */}
          <div>
            <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
              Booking Type
            </label>
            <select
              value={bookingType}
              onChange={(e) => setBookingType(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="Study Session">Study Session</option>
              <option value="Ad-hoc Booking">Ad-hoc Booking</option>
              <option value="Regular Class">Regular Class</option>
              {user?.role === 'admin' && <option value="Maintenance">Maintenance</option>}
            </select>
          </div>

          {/* Reservation Scope Selector: Specific Seats vs Full Room */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-semibold uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>Reservation Scope</span>
              <span className="text-[10px] text-slate-400 font-normal">Choose individual seats or entire room</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Option 1: Pick Specific Seats */}
              <button
                type="button"
                onClick={() => {
                  setBookingScope('seats');
                  setShowSeatMap(true);
                }}
                className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all text-left cursor-pointer ${
                  bookingScope === 'seats'
                    ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm ring-1 ring-blue-500'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Armchair className={`w-4 h-4 ${bookingScope === 'seats' ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span className={bookingScope === 'seats' ? 'text-white' : 'text-slate-300'}>Select Specific Seats</span>
                  </div>
                  {bookingScope === 'seats' && (
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                  Book 1 or multiple green seats. Other seats stay open for concurrent student bookings.
                </p>
              </button>

              {/* Option 2: Full Room Session (Only available if all seats are green) */}
              <button
                type="button"
                disabled={isRoomPartiallyOrFullyOccupied}
                onClick={() => {
                  if (isRoomPartiallyOrFullyOccupied) return;
                  setBookingScope('full_room');
                  setSelectedSeats([]);
                  setShowSeatMap(false);
                }}
                className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all text-left ${
                  isRoomPartiallyOrFullyOccupied
                    ? 'opacity-40 cursor-not-allowed bg-slate-950/40 border-white/5 text-slate-500'
                    : bookingScope === 'full_room'
                    ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm ring-1 ring-blue-500 cursor-pointer'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 cursor-pointer'
                }`}
                title={
                  isRoomPartiallyOrFullyOccupied
                    ? 'Full Room Session is unavailable because some seats are already occupied. You can only book available green seats.'
                    : `Reserve all ${room.capacity} seats for this room`
                }
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Users className={`w-4 h-4 ${isRoomPartiallyOrFullyOccupied ? 'text-slate-500' : bookingScope === 'full_room' ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span className={isRoomPartiallyOrFullyOccupied ? 'text-slate-500 line-through' : bookingScope === 'full_room' ? 'text-white' : 'text-slate-300'}>
                      Full Room Session
                    </span>
                  </div>
                  {isRoomPartiallyOrFullyOccupied ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-500/15 text-rose-300 border border-rose-500/20">
                      Unavailable
                    </span>
                  ) : bookingScope === 'full_room' ? (
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  ) : null}
                </div>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  {isRoomPartiallyOrFullyOccupied
                    ? 'Disabled: Only available when ALL seats are 100% free/green.'
                    : `Reserve all ${room.capacity} seats for an entire class lecture or seminar.`}
                </p>
              </button>
            </div>
          </div>

          {/* Full Room Notice Banner */}
          {bookingScope === 'full_room' && (
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <Users className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Full Room Reservation ({room.capacity} Seats)</span>
              </div>
              <p className="text-[11px] text-slate-300">
                All {room.capacity} seats in <strong>{room.roomNumber} ({room.building})</strong> will be reserved exclusively for this session. Outside walk-ins will be blocked during this time.
              </p>
            </div>
          )}

          {/* Interactive Multi-Seat Selector Section (Shown when in 'seats' mode) */}
          {bookingScope === 'seats' && (
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <Armchair className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold text-slate-200">
                    Interactive Seat Selector
                  </span>
                  {selectedSeats.length > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-300 font-mono font-bold text-[11px] border border-blue-500/30">
                      {selectedSeats.length === 1
                        ? `Seat #${selectedSeats[0]}`
                        : `${selectedSeats.length} Seats: #${selectedSeats.join(', #')}`}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-medium border border-amber-500/20">
                      No seats selected yet
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowSeatMap(!showSeatMap)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>
                    {showSeatMap
                      ? 'Collapse Detail'
                      : selectedSeats.length > 0
                      ? `Edit (${selectedSeats.length} Seats)`
                      : 'Open Seat Detail'}
                  </span>
                  {showSeatMap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showSeatMap && (
                <div className="pt-2 border-t border-slate-800">
                  <SeatMap
                    room={room}
                    isOccupied={isOccupied}
                    isFullRoomOccupied={isFullRoomOccupied}
                    occupiedSeats={occupiedSeats}
                    reservedSeats={reservedSeats}
                    currentBooking={currentBooking}
                    selectedSeats={selectedSeats}
                    onSelectSeat={(seats) => setSelectedSeats(Array.isArray(seats) ? seats : seats ? [seats] : [])}
                    interactive={true}
                    allowMultiple={true}
                  />
                </div>
              )}
            </div>
          )}

          {/* Purpose & Module Code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-slate-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Module / Subject & Purpose
              </label>
              <span className="text-[10px] text-slate-400 font-normal">Select or type custom</span>
            </div>

            {/* Quick Subject Select Dropdown */}
            <select
              value={SUBJECTS.some((s) => s.label === purpose) ? purpose : (purpose ? 'custom' : '')}
              onChange={(e) => {
                if (e.target.value !== 'custom' && e.target.value !== '') {
                  setPurpose(e.target.value);
                }
              }}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Quick Select London Met Subject Module --</option>
              {SUBJECTS.map((sub) => (
                <option key={sub.code} value={`${sub.code}: ${sub.name}`}>
                  {sub.code} — {sub.name}
                </option>
              ))}
              <option value="custom">✍️ Custom Purpose / Enter manually below</option>
            </select>

            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. CS5053NI: Cloud Computing and IoT Lab"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="krono-btn krono-btn-ghost text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="krono-btn krono-btn-primary text-xs flex items-center gap-2 font-semibold shadow-sm cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Checking Availability...</span>
                </>
              ) : (
                <span>
                  {selectedSeats.length > 0
                    ? `Confirm (${selectedSeats.length} ${selectedSeats.length === 1 ? 'Seat' : 'Seats'}: #${selectedSeats.join(', #')})`
                    : 'Confirm Booking'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
