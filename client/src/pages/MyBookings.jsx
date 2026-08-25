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
  Swords,
  Scroll,
  Hourglass,
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
        showToast('⚔️ Check-in Confirmed! Chamber occupancy verified.');
        fetchMyBookings();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to check in.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Abandon this reservation? The slot will immediately free up for other campus members.')) {
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
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-3 bg-black border-2 border-emerald-500 text-emerald-300 shadow-[4px_4px_0px_#000] flex items-center gap-2 text-xs font-pixel animate-bounce">
          <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-pixel font-bold text-white tracking-wide">
            📜 HERO QUEST LOG & SCHEDULE
          </h1>
          <p className="text-xs font-pixel text-slate-400 mt-0.5">
            Manage your booked chambers, check in upon party arrival, and view past records.
          </p>
        </div>

        <button
          onClick={fetchMyBookings}
          className="pixel-btn pixel-btn-dark text-xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Log
        </button>
      </div>

      {/* 15-Minute Auto-Release Warning Banner */}
      <div className="pixel-box p-4 border-yellow-500/60 flex items-start gap-3 bg-yellow-950/40">
        <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
        <div className="text-xs font-pixel text-yellow-200 space-y-0.5">
          <span className="font-bold uppercase tracking-wider text-yellow-300">
            ⚠️ 15-Minute Check-In Spell Grace Period:
          </span>
          <p className="text-yellow-200/80 leading-relaxed">
            Please press "⚔️ Check In" upon arriving at your chamber. If a reservation is not checked in
            within 15 minutes of start time, the system will auto-cancel and release the chamber for walk-ins!
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b-2 border-slate-800 gap-2">
        <button
          onClick={() => setFilterTab('upcoming')}
          className={`pixel-btn text-xs ${
            filterTab === 'upcoming' ? 'pixel-btn-green' : 'pixel-btn-dark text-slate-400'
          }`}
        >
          Active Quests ({bookings.filter((b) => new Date(b.endTime) >= now && b.status === 'confirmed').length})
        </button>
        <button
          onClick={() => setFilterTab('past')}
          className={`pixel-btn text-xs ${
            filterTab === 'past' ? 'pixel-btn-indigo' : 'pixel-btn-dark text-slate-400'
          }`}
        >
          Past Raids & Cancelled ({bookings.filter((b) => !(new Date(b.endTime) >= now && b.status === 'confirmed')).length})
        </button>
        <button
          onClick={() => setFilterTab('all')}
          className={`pixel-btn text-xs ${
            filterTab === 'all' ? 'pixel-btn-purple' : 'pixel-btn-dark text-slate-400'
          }`}
        >
          All Records ({bookings.length})
        </button>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 animate-spin border border-black"></div>
          <p className="font-pixel text-xs text-slate-400">Loading your quest log...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="pixel-box p-12 text-center space-y-3">
          <Scroll className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="font-pixel text-base font-bold text-white">No quests found in this category</h3>
          <p className="font-pixel text-xs text-slate-400 max-w-sm mx-auto">
            You don't have any bookings under the "{filterTab}" view. Explore available chambers on the matrix.
          </p>
          <a
            href="/dashboard"
            className="pixel-btn pixel-btn-green text-xs"
          >
            <span>⚔️ Browse Chambers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => {
            const start = new Date(booking.startTime);
            const end = new Date(booking.endTime);
            const isLiveNow = start <= now && end > now && booking.status === 'confirmed';

            return (
              <div
                key={booking._id}
                className="pixel-box-hover p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Side */}
                <div className="space-y-1.5 font-pixel">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-arcade text-xs bg-black text-white px-2 py-0.5 border border-slate-700">
                      {booking.room?.roomNumber || 'Chamber'}
                    </span>
                    <span className="text-xs text-slate-300 font-bold">
                      {booking.room?.building}
                    </span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 bg-slate-950 border border-slate-800 text-slate-400">
                      {booking.bookingType}
                    </span>

                    {/* Status Pill */}
                    {booking.status === 'confirmed' ? (
                      <span className="text-[10px] uppercase px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Confirmed
                      </span>
                    ) : booking.status === 'cancelled' ? (
                      <span className="text-[10px] uppercase px-1.5 py-0.5 bg-rose-950 text-rose-300 border border-rose-800">
                        Cancelled
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase px-1.5 py-0.5 bg-slate-800 text-slate-300">
                        Completed
                      </span>
                    )}

                    {/* Check-In Pill */}
                    {booking.checkedIn ? (
                      <span className="text-[10px] uppercase px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Checked In
                      </span>
                    ) : booking.status === 'confirmed' ? (
                      <span className="text-[10px] uppercase px-1.5 py-0.5 bg-yellow-950 text-yellow-300 border border-yellow-800">
                        Check-in Pending
                      </span>
                    ) : null}
                  </div>

                  <p className="text-sm font-bold text-white">{booking.purpose}</p>

                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1 font-mono text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      {format(start, 'dd MMM yyyy')}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
                    </span>
                    <TimeElapsedBadge timestamp={booking.createdAt} prefix="Created" />
                  </div>
                </div>

                {/* Right Side Actions */}
                {booking.status === 'confirmed' && (
                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    {!booking.checkedIn && (
                      <button
                        onClick={() => handleCheckIn(booking._id)}
                        disabled={actionLoadingId === booking._id}
                        className="pixel-btn pixel-btn-green text-xs"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>⚔️ Check In</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCancel(booking._id)}
                      disabled={actionLoadingId === booking._id}
                      className="pixel-btn pixel-btn-rose text-xs"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Abandon</span>
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
