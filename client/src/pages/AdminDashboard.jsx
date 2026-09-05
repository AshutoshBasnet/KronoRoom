import React, { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building,
  RefreshCw,
  Search,
  Filter,
  Monitor,
  Sparkles,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../utils/api';
import socket from '../utils/socket';
import TimeElapsedBadge from '../components/TimeElapsedBadge';

export const AdminDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, completed: 0, cancelled: 0, checkedIn: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filter state for bookings table
  const [statusFilter, setStatusFilter] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');

  // Modals
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomFormData, setRoomFormData] = useState({
    roomNumber: '',
    building: 'Skill Block',
    capacity: 40,
    type: 'computer_lab',
    amenities: ''
  });

  const [toastMessage, setToastMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchData = async () => {
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/bookings/all')
      ]);

      if (roomsRes.data.success) {
        setRooms(roomsRes.data.rooms || []);
      }

      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.bookings || []);
        setStats(bookingsRes.data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleUpdate = () => fetchData();

    socket.on('booking:created', handleUpdate);
    socket.on('booking:cancelled', handleUpdate);
    socket.on('booking:checkedIn', handleUpdate);
    socket.on('booking:autoReleased', handleUpdate);
    socket.on('room:created', handleUpdate);
    socket.on('room:updated', handleUpdate);
    socket.on('room:deleted', handleUpdate);

    return () => {
      socket.off('booking:created', handleUpdate);
      socket.off('booking:cancelled', handleUpdate);
      socket.off('booking:checkedIn', handleUpdate);
      socket.off('booking:autoReleased', handleUpdate);
      socket.off('room:created', handleUpdate);
      socket.off('room:updated', handleUpdate);
      socket.off('room:deleted', handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (isRoomModalOpen) {
      document.body.classList.add('modal-open');
      document.body.setAttribute('data-modal-open', 'true');
      window.dispatchEvent(
        new CustomEvent('krono:modal-state', { detail: { isOpen: true, type: 'admin-room' } })
      );
    } else {
      document.body.classList.remove('modal-open');
      document.body.removeAttribute('data-modal-open');
      window.dispatchEvent(
        new CustomEvent('krono:modal-state', { detail: { isOpen: false, type: 'admin-room' } })
      );
    }

    return () => {
      document.body.classList.remove('modal-open');
      document.body.removeAttribute('data-modal-open');
      window.dispatchEvent(
        new CustomEvent('krono:modal-state', { detail: { isOpen: false, type: 'admin-room' } })
      );
    };
  }, [isRoomModalOpen]);

  const openCreateRoomModal = () => {
    setEditingRoom(null);
    setRoomFormData({
      roomNumber: '',
      building: 'Tower Building',
      capacity: 40,
      type: 'computer_lab',
      amenities: 'Projector, Gigabit LAN, Whiteboard'
    });
    setIsRoomModalOpen(true);
  };

  const openEditRoomModal = (room) => {
    setEditingRoom(room);
    setRoomFormData({
      roomNumber: room.roomNumber,
      building: room.building,
      capacity: room.capacity,
      type: room.type,
      amenities: room.amenities?.join(', ') || ''
    });
    setIsRoomModalOpen(true);
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingRoom) {
        const { data } = await api.put(`/rooms/${editingRoom._id}`, roomFormData);
        if (data.success) {
          showToast(`Room ${data.room.roomNumber} updated successfully!`);
          setIsRoomModalOpen(false);
          fetchData();
        }
      } else {
        const { data } = await api.post('/rooms', roomFormData);
        if (data.success) {
          showToast(`Room ${data.room.roomNumber} created successfully!`);
          setIsRoomModalOpen(false);
          fetchData();
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save room details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (!window.confirm(`Are you sure you want to deactivate Room ${roomNumber}? It will be hidden from new bookings.`)) {
      return;
    }

    try {
      const { data } = await api.delete(`/rooms/${roomId}`);
      if (data.success) {
        showToast(`Room ${roomNumber} deactivated.`);
        fetchData();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to deactivate room.');
    }
  };

  const handleAdminCancelBooking = async (bookingId, roomNumber) => {
    if (!window.confirm(`Cancel booking for Room ${roomNumber}? This administrative override cannot be undone.`)) {
      return;
    }

    try {
      const { data } = await api.patch(`/bookings/${bookingId}/cancel`);
      if (data.success) {
        showToast(`Booking cancelled via admin override.`);
        fetchData();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase().trim();
      const matchUser = b.user?.name?.toLowerCase().includes(q) || b.user?.email?.toLowerCase().includes(q);
      const matchRoom = b.room?.roomNumber?.toLowerCase().includes(q);
      const matchPurpose = b.purpose?.toLowerCase().includes(q);
      if (!matchUser && !matchRoom && !matchPurpose) return false;
    }
    return true;
  });

  const totalCapacity = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
  const liveInSessionCount = bookings.filter(
    (b) =>
      b.status === 'confirmed' &&
      new Date(b.startTime) <= new Date() &&
      new Date(b.endTime) >= new Date()
  ).length;

  return (
    <div className="min-h-screen bg-transparent text-slate-100 px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12 max-w-7xl mx-auto space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 shadow-2xl flex items-center gap-3 animate-bounce">
          <Shield className="w-5 h-5 text-blue-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header matching Stitch Admin Console */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Admin Management Console
            </h1>
            <div className="hidden sm:flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-full shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[#10b981] pulse-dot" />
              <span className="font-mono text-[11px] text-emerald-400 uppercase tracking-wider font-bold">
                All Systems Operational
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            London Metropolitan University Estates & IT • Central Campus Hub
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreateRoomModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Campus Room</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Grid (Stitch Institutional Precision) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900/80 backdrop-blur-md p-5 border border-slate-800/90 rounded-2xl flex items-center space-x-4 relative overflow-hidden group shadow-sm">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 group-hover:w-2 transition-all" />
          <div className="p-3 bg-blue-600/15 rounded-xl text-blue-400 border border-blue-500/20">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-bold">
              Active Campus Facilities
            </p>
            <p className="text-xl font-bold font-mono text-white mt-0.5">
              {rooms.length} Rooms Online
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/80 backdrop-blur-md p-5 border border-slate-800/90 rounded-2xl flex items-center space-x-4 relative overflow-hidden group shadow-sm">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 group-hover:w-2 transition-all" />
          <div className="p-3 bg-blue-600/15 rounded-xl text-blue-400 border border-blue-500/20">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-bold">
              Total Capacity
            </p>
            <p className="text-xl font-bold font-mono text-white mt-0.5">
              {totalCapacity} Workstations
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/80 backdrop-blur-md p-5 border border-slate-800/90 rounded-2xl flex items-center space-x-4 relative overflow-hidden group shadow-sm">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500 group-hover:w-2 transition-all" />
          <div className="p-3 bg-amber-500/15 rounded-xl text-amber-400 border border-amber-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-bold">
              Live Occupancy
            </p>
            <p className="text-xl font-bold font-mono text-white mt-0.5">
              {liveInSessionCount || stats.checkedIn || stats.confirmed || 0} In-Session
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/80 backdrop-blur-md p-5 border border-slate-800/90 rounded-2xl flex items-center space-x-4 relative overflow-hidden group shadow-sm">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#10b981] group-hover:w-2 transition-all" />
          <div className="p-3 bg-emerald-500/15 rounded-xl text-emerald-400 border border-emerald-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-bold">
              Real-Time Sync
            </p>
            <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
              100% Telemetry
            </p>
          </div>
        </div>
      </section>

      {/* Room Inventory Management Section (Stitch Precision) */}
      <section className="bg-slate-900/80 backdrop-blur-md border border-slate-800/90 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Room Inventory Management
            </h2>
            <p className="text-xs text-slate-400">
              Active physical classroom and lab resources across university blocks
            </p>
          </div>
          <span className="font-mono text-xs text-slate-400 font-semibold px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
            {rooms.length} Registered Rooms
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 font-mono text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-5 font-bold">Room Name</th>
                <th className="py-3 px-4 font-bold">Building</th>
                <th className="py-3 px-4 font-bold">Capacity</th>
                <th className="py-3 px-4 font-bold">Type</th>
                <th className="py-3 px-4 font-bold">Amenities</th>
                <th className="py-3 px-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs text-slate-200">
              {rooms.map((r) => (
                <tr key={r._id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="py-3.5 px-5 font-mono font-bold text-white text-sm">
                    {r.roomNumber}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-medium">{r.building}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">
                    {r.capacity} Seats
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-600/15 text-blue-300 border border-blue-500/30 capitalize">
                      {r.type?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                    {r.amenities?.join(', ') || 'Standard Academic Equipment'}
                  </td>
                  <td className="py-3.5 px-5 text-right space-x-2">
                    <button
                      onClick={() => openEditRoomModal(r)}
                      className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer hover:underline"
                    >
                      Edit
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      onClick={() => handleDeleteRoom(r._id, r.roomNumber)}
                      className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer hover:underline"
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Campus-Wide Bookings Audit Section (Stitch Precision) */}
      <section className="bg-slate-900/80 backdrop-blur-md border border-slate-800/90 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Campus-Wide Bookings Audit
            </h2>
            <p className="text-xs text-slate-400">
              Live audit trail of reservations, active occupancies, and check-in verifications
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder="Search user, room, purpose..."
                className="bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Bookings Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 font-mono text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-5 font-bold">Booking ID</th>
                <th className="py-3 px-4 font-bold">Room & Seat</th>
                <th className="py-3 px-4 font-bold">Booked By</th>
                <th className="py-3 px-4 font-bold">Schedule / Purpose</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold">Check-In</th>
                <th className="py-3 px-5 font-bold text-right">Administrative Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs text-slate-200">
              {filteredBookings.map((b) => {
                const isCurrentSession =
                  b.status === 'confirmed' &&
                  new Date(b.startTime) <= new Date() &&
                  new Date(b.endTime) >= new Date();

                return (
                  <tr key={b._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-slate-400 text-xs">
                      #BK-{b._id.slice(-4).toUpperCase()}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{b.room?.roomNumber || '—'}</span>
                        {(b.selectedSeats?.length > 0 || b.seatNumber) && (
                          <>
                            <span className="text-slate-600">—</span>
                            <span className="text-blue-400 font-bold">
                              {b.selectedSeats?.length > 1
                                ? `Seats: ${b.selectedSeats.join(', ')}`
                                : `Seat #${b.seatNumber || b.selectedSeats?.[0]}`}
                            </span>
                          </>
                        )}
                      </div>
                      <span className="block font-sans text-[10px] font-normal text-slate-400 mt-0.5">
                        {b.room?.building}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-white block">{b.user?.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {b.user?.idCardNumber || 'N/A'}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                            b.user?.role === 'faculty' || b.user?.role === 'admin'
                              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {b.user?.role || 'STUDENT'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="font-medium text-slate-100 block truncate">
                        {b.purpose}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 block mt-0.5">
                        {format(new Date(b.startTime), 'dd MMM')} •{' '}
                        {format(new Date(b.startTime), 'HH:mm')} –{' '}
                        {format(new Date(b.endTime), 'HH:mm')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {isCurrentSession ? (
                        <span className="px-2.5 py-1 bg-blue-600 text-white rounded-full text-[10px] font-bold tracking-wider flex items-center w-max gap-1.5 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span>In-Session</span>
                        </span>
                      ) : (
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : b.status === 'cancelled'
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {b.status}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {b.checkedIn ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold text-[11px]">
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => handleAdminCancelBooking(b._id, b.room?.roomNumber)}
                          className="px-3 py-1.5 border border-rose-500/40 hover:bg-rose-500/20 text-rose-300 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
                        >
                          Release Seat
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create / Edit Room Modal */}
      {isRoomModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsRoomModalOpen(false);
          }}
        >
          <div className="krono-modal max-w-md w-full rounded-2xl p-6 space-y-4 border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-heading">
                {editingRoom ? `Edit Room ${editingRoom.roomNumber}` : 'Create Campus Room'}
              </h3>
              <button
                onClick={() => setIsRoomModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRoomSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold uppercase mb-1">
                  Room Number (e.g. T-301)
                </label>
                <input
                  type="text"
                  value={roomFormData.roomNumber}
                  onChange={(e) =>
                    setRoomFormData({ ...roomFormData, roomNumber: e.target.value })
                  }
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white uppercase font-mono focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase mb-1">Building</label>
                <input
                  type="text"
                  value={roomFormData.building}
                  onChange={(e) =>
                    setRoomFormData({ ...roomFormData, building: e.target.value })
                  }
                  placeholder="Skill Block, London Block, Kumari Block"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold uppercase mb-1">
                    Capacity (Seats)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={roomFormData.capacity}
                    onChange={(e) =>
                      setRoomFormData({ ...roomFormData, capacity: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold uppercase mb-1">Room Type</label>
                  <select
                    value={roomFormData.type}
                    onChange={(e) => setRoomFormData({ ...roomFormData, type: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="computer_lab">Computer Lab</option>
                    <option value="lecture_hall">Lecture Hall</option>
                    <option value="seminar_room">Seminar Room</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold uppercase mb-1">
                  Amenities (Comma separated)
                </label>
                <textarea
                  rows="2"
                  value={roomFormData.amenities}
                  onChange={(e) =>
                    setRoomFormData({ ...roomFormData, amenities: e.target.value })
                  }
                  placeholder="Dual 4K Projectors, Surround Audio, Wi-Fi 6"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="krono-btn krono-btn-ghost text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="krono-btn krono-btn-primary text-xs shadow-sm cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : editingRoom ? 'Save Changes' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
