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

  return (
    <div className="min-h-screen bg-transparent text-slate-100 px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12 max-w-7xl mx-auto space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 shadow-2xl flex items-center gap-3 animate-bounce">
          <Shield className="w-5 h-5 text-blue-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              KronoRoom Admin Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Admin Access
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage classrooms & labs, monitor campus-wide booking utilization, and oversee schedule overrides.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="krono-btn krono-btn-ghost text-xs border border-slate-800 hover:border-slate-700 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
          </button>
          <button
            onClick={openCreateRoomModal}
            className="krono-btn krono-btn-primary text-xs shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Room
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="krono-card p-4 rounded-xl border border-slate-800/80 bg-slate-900/70 shadow-sm">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Bookings</span>
          <p className="text-2xl font-bold font-mono text-white mt-1">{stats.total || 0}</p>
        </div>
        <div className="krono-card p-4 rounded-xl border border-emerald-500/30 bg-slate-900/70 shadow-sm">
          <span className="text-[11px] text-emerald-400 uppercase font-semibold">Confirmed</span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{stats.confirmed || 0}</p>
        </div>
        <div className="krono-card p-4 rounded-xl border border-blue-500/30 bg-slate-900/70 shadow-sm">
          <span className="text-[11px] text-blue-400 uppercase font-semibold">Checked-In</span>
          <p className="text-2xl font-bold font-mono text-blue-300 mt-1">{stats.checkedIn || 0}</p>
        </div>
        <div className="krono-card p-4 rounded-xl border border-rose-500/30 bg-slate-900/70 shadow-sm">
          <span className="text-[11px] text-rose-400 uppercase font-semibold">Cancelled</span>
          <p className="text-2xl font-bold font-mono text-rose-400 mt-1">{stats.cancelled || 0}</p>
        </div>
        <div className="krono-card p-4 rounded-xl border border-slate-800/80 bg-slate-900/70 shadow-sm">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Check-In Rate</span>
          <p className="text-2xl font-bold font-mono text-slate-200 mt-1">
            {stats.total > 0 ? `${Math.round((stats.checkedIn / stats.total) * 100)}%` : '0%'}
          </p>
        </div>
      </div>

      {/* Campus Rooms Inventory */}
      <div className="krono-card p-6 rounded-2xl space-y-4 border border-slate-800 bg-slate-900/70 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white font-heading">
              Classroom & Laboratory Inventory ({rooms.length})
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((r) => (
            <div
              key={r._id}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between shadow-sm hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-base text-white">{r.roomNumber}</span>
                  <span className="px-2 py-0.5 text-[10px] uppercase font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {r.type?.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {r.building} • {r.capacity} seats
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {r.amenities?.slice(0, 2).map((a, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-900 rounded text-slate-400 border border-slate-800">
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditRoomModal(r)}
                  className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Edit Room"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteRoom(r._id, r.roomNumber)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Deactivate Room"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campus-Wide Bookings Registry */}
      <div className="krono-card p-6 rounded-2xl space-y-4 border border-slate-800 bg-slate-900/70 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white font-heading">
              All University Booking Records ({filteredBookings.length})
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder="Search user, room..."
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

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider bg-slate-950/80">
                <th className="p-3">Room</th>
                <th className="p-3">User & Department</th>
                <th className="p-3">Schedule Date & Time</th>
                <th className="p-3">Purpose / Type</th>
                <th className="p-3">Status</th>
                <th className="p-3">Check-In</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredBookings.map((b) => (
                <tr key={b._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-white">
                    {b.room?.roomNumber || '—'}
                    <span className="block font-sans text-[10px] font-normal text-slate-400">
                      {b.room?.building}
                    </span>
                    {(b.selectedSeats?.length > 0 || b.seatNumber) && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-blue-600/15 text-blue-300 font-mono text-[9px] border border-blue-500/30">
                        {b.selectedSeats?.length > 1
                          ? `Seats: ${b.selectedSeats.join(', ')}`
                          : `Seat #${b.seatNumber || b.selectedSeats?.[0]}`}
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    <span className="font-semibold text-white">{b.user?.name}</span>
                    <span className="block text-[10px] text-slate-400 font-mono">
                      {b.user?.idCardNumber} • {b.user?.role}
                    </span>
                  </td>

                  <td className="p-3 font-mono text-[11px]">
                    {format(new Date(b.startTime), 'dd MMM yyyy')}
                    <span className="block text-slate-400">
                      {format(new Date(b.startTime), 'HH:mm')} – {format(new Date(b.endTime), 'HH:mm')}
                    </span>
                  </td>

                  <td className="p-3 max-w-[200px]">
                    <span className="font-medium text-slate-200 block truncate">{b.purpose}</span>
                    <span className="text-[10px] text-slate-400 uppercase">{b.bookingType}</span>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : b.status === 'cancelled'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>

                  <td className="p-3">
                    {b.checkedIn ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Yes
                      </span>
                    ) : (
                      <span className="text-amber-400 font-semibold">Pending</span>
                    )}
                  </td>

                  <td className="p-3 text-right">
                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => handleAdminCancelBooking(b._id, b.room?.roomNumber)}
                        className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                      >
                        Override Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Room Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
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
