import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../utils/api';
import socket from '../utils/socket';
import { useAuth } from '../context/AuthContext';
import TimeElapsedBadge from '../components/TimeElapsedBadge';

export const MyBookings = () => {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('upcoming');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchMyBookings = async () => {
    try {
      const { data } = await api.get('/bookings/my-bookings');
      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching personal bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();

    const handleUpdate = () => fetchMyBookings();

    socket.on('booking:created', handleUpdate);
    socket.on('booking:cancelled', handleUpdate);
    socket.on('booking:checkedIn', handleUpdate);
    socket.on('booking:autoReleased', handleUpdate);

    return () => {
      socket.off('booking:created', handleUpdate);
      socket.off('booking:cancelled', handleUpdate);
      socket.off('booking:checkedIn', handleUpdate);
      socket.off('booking:autoReleased', handleUpdate);
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCheckIn = async (bookingId) => {
    setActionLoadingId(bookingId);
    try {
      const { data } = await api.patch(`/bookings/${bookingId}/check-in`);
      if (data.success) {
        showToast('Check-in confirmed! Your room occupancy is verified.');
        fetchMyBookings();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to check in.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will immediately free the slot for others.')) {
      return;
    }

    setActionLoadingId(bookingId);
    try {
      const { data } = await api.patch(`/bookings/${bookingId}/cancel`);
      if (data.success) {
        showToast('Booking cancelled successfully.');
        fetchMyBookings();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const now = new Date();

  const filteredBookings = bookings.filter((b) => {
    const isUpcoming = new Date(b.endTime) >= now && b.status === 'confirmed';
    if (filterTab === 'upcoming') return isUpcoming;
    if (filterTab === 'past') return !isUpcoming;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-indigo-900/95 backdrop-blur-xl border border-indigo-400/40 text-white shadow-2xl flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            My Campus Schedule
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your bookings, check in upon arrival, and view past records.
          </p>
        </div>

        <button
          onClick={fetchMyBookings}
          className="krono-btn krono-btn-ghost text-xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* 15-Minute Auto-Release Warning Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200">
          <span className="font-bold">Check-in Grace Period (15 Minutes):</span>
          <p className="mt-0.5 text-amber-200/80 leading-relaxed">
            Please click "Check In" upon arriving at the room. If a booking remains unconfirmed 15
            minutes after its scheduled start time, the system will automatically release the slot for
            walk-in campus members.
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setFilterTab('upcoming')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            filterTab === 'upcoming'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Upcoming & Active ({bookings.filter((b) => new Date(b.endTime) >= now && b.status === 'confirmed').length})
        </button>
        <button
          onClick={() => setFilterTab('past')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            filterTab === 'past'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          History & Cancelled ({bookings.filter((b) => !(new Date(b.endTime) >= now && b.status === 'confirmed')).length})
        </button>
        <button
          onClick={() => setFilterTab('all')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            filterTab === 'all'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          All Records ({bookings.length})
        </button>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium">Loading your bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="krono-card rounded-2xl p-12 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No bookings found in this category</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You don't have any reservations under the "{filterTab}" view.
          </p>
          <a
            href="/dashboard"
            className="krono-btn krono-btn-primary text-xs inline-flex items-center gap-2"
          >
            <span>Browse Rooms</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const start = new Date(booking.startTime);
            const end = new Date(booking.endTime);
            const isLiveNow = start <= now && end > now && booking.status === 'confirmed';

            return (
              <div
                key={booking._id}
                className="krono-card-hover rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Side */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-base font-bold text-white bg-indigo-500/20 px-2.5 py-0.5 rounded-lg border border-indigo-500/30">
                      {booking.room?.roomNumber || 'Room'}
                    </span>
                    <span className="text-xs text-slate-300 font-semibold">
                      {booking.room?.building}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md bg-white/5 border border-white/10 text-slate-400">
                      {booking.bookingType}
                    </span>

                    {/* Status Pill */}
                    {booking.status === 'confirmed' ? (
                      <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Confirmed
                      </span>
                    ) : booking.status === 'cancelled' ? (
                      <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Cancelled
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md bg-slate-700 text-slate-300">
                        Completed
                      </span>
                    )}

                    {/* Check-In Pill */}
                    {booking.checkedIn ? (
                      <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Checked In
                      </span>
                    ) : booking.status === 'confirmed' ? (
                      <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Check-in Pending
                      </span>
                    ) : null}
                  </div>

                  <p className="text-sm font-semibold text-slate-200">{booking.purpose}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1.5 font-mono text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      {format(start, 'EEE, dd MMM yyyy')}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
                    </span>
                    <TimeElapsedBadge timestamp={booking.createdAt} prefix="Created" />
                  </div>
                </div>

                {/* Right Side Actions */}
                {booking.status === 'confirmed' && (
                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                    {!booking.checkedIn && (
                      <button
                        onClick={() => handleCheckIn(booking._id)}
                        disabled={actionLoadingId === booking._id}
                        className="krono-btn krono-btn-success text-xs"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Check In</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCancel(booking._id)}
                      disabled={actionLoadingId === booking._id}
                      className="krono-btn krono-btn-danger text-xs"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
